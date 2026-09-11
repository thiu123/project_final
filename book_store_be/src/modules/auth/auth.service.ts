import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { CookieOptions, Response } from 'express';
import { Model } from 'mongoose';
import { Profile } from 'passport-google-oauth20';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { User, UserDocument } from '../users/schemas/user.schema';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto/auth.dto';

const REFRESH_COOKIE = 'refreshToken';
const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  path: '/',
  sameSite: 'strict',
  secure: false,
};

const ACCESS_TOKEN_TTL = '30d';
const REFRESH_TOKEN_TTL = '365d';
const RESET_TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ---------------------------------------------------------------------
  // Tokens
  // ---------------------------------------------------------------------

  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_KEY'),
      expiresIn: ACCESS_TOKEN_TTL,
    });
  }

  generateRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_KEY'),
      expiresIn: REFRESH_TOKEN_TTL,
    });
  }

  private toPayload(user: { id?: unknown; _id?: unknown; admin: boolean }): JwtPayload {
    return { id: String(user.id ?? user._id), admin: user.admin };
  }

  private setRefreshCookie(res: Response, refreshToken: string): void {
    res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);
  }

  /** Strips secrets before returning a user document to the client. */
  private sanitize(user: UserDocument) {
    const { password, resetPasswordToken, resetPasswordExpires, ...others } = user.toObject();
    void password;
    void resetPasswordToken;
    void resetPasswordExpires;
    return others;
  }

  private async hashPassword(plain: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plain, salt);
  }

  // ---------------------------------------------------------------------
  // Register / Login / Refresh
  // ---------------------------------------------------------------------

  async register(dto: RegisterDto) {
    const hashedPassword = await this.hashPassword(dto.password);
    const user = await new this.userModel({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
    }).save();
    return this.sanitize(user);
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.userModel.findOne({ username: dto.username });
    if (!user) {
      throw new HttpException({ msg: 'User not found' }, HttpStatus.BAD_REQUEST);
    }

    const validPassword = await bcrypt.compare(dto.password, user.password ?? '');
    if (!validPassword) {
      throw new HttpException({ msg: 'Invalid password' }, HttpStatus.BAD_REQUEST);
    }

    const payload = this.toPayload(user);
    const accessToken = this.generateAccessToken(payload);
    this.setRefreshCookie(res, this.generateRefreshToken(payload));

    return { msg: 'Login successful', accessToken, ...this.sanitize(user) };
  }

  refresh(refreshToken: string | undefined, res: Response) {
    if (!refreshToken) {
      throw new HttpException({ msg: 'You are not authenticated' }, HttpStatus.UNAUTHORIZED);
    }

    let decoded: JwtPayload;
    try {
      decoded = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_KEY'),
      });
    } catch {
      throw new HttpException({ msg: 'Refresh token is not valid' }, HttpStatus.FORBIDDEN);
    }

    const payload = this.toPayload(decoded);
    const accessToken = this.generateAccessToken(payload);
    this.setRefreshCookie(res, this.generateRefreshToken(payload));

    return { accessToken };
  }

  // ---------------------------------------------------------------------
  // Password management
  // ---------------------------------------------------------------------

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException({ msg: 'User not found' }, HttpStatus.BAD_REQUEST);
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password ?? '');
    if (!isMatch) {
      throw new HttpException({ msg: 'Invalid current password' }, HttpStatus.BAD_REQUEST);
    }

    user.password = await this.hashPassword(dto.newPassword);
    await user.save();
    return { msg: 'Password changed successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const { email } = dto;
    if (!email) {
      throw new HttpException({ msg: 'Email is required' }, HttpStatus.BAD_REQUEST);
    }

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new HttpException({ msg: 'User not found with this email' }, HttpStatus.NOT_FOUND);
    }

    if (!user.password) {
      throw new HttpException(
        { msg: 'This account uses Google login. Please use Google to sign in.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = this.hashResetToken(resetToken);
    user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await user.save();

    return {
      msg: 'Password reset token generated',
      resetToken,
      email: user.email,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { token, newPassword } = dto;

    if (!token || !newPassword) {
      throw new HttpException(
        { msg: 'Reset token and new password are required' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (newPassword.length < 6) {
      throw new HttpException(
        { msg: 'Password must be at least 6 characters' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userModel.findOne({
      resetPasswordToken: this.hashResetToken(token),
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new HttpException({ msg: 'Invalid or expired reset token' }, HttpStatus.BAD_REQUEST);
    }

    user.password = await this.hashPassword(newPassword);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return { msg: 'Password reset successfully' };
  }

  private hashResetToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // ---------------------------------------------------------------------
  // Google OAuth
  // ---------------------------------------------------------------------

  /** Finds or creates the local user for a Google profile. */
  async validateGoogleUser(profile: Profile): Promise<UserDocument> {
    const photo = profile.photos?.[0]?.value;
    let user = await this.userModel.findOne({ googleId: profile.id });

    if (!user) {
      user = new this.userModel({
        username: profile.displayName,
        googleId: profile.id,
        email: profile.emails?.[0]?.value,
        avatar_url: photo,
      });
      await user.save();
      return user;
    }

    // Google mints a fresh `lh3.googleusercontent.com` URL whenever the member
    // changes their picture and stops serving the old one, so the photo has to
    // be re-read on every sign-in — storing it once at account creation left
    // accounts pointing at a URL that had since gone dead.
    if (photo && user.avatar_url !== photo) {
      user.avatar_url = photo;
      await user.save();
    }

    return user;
  }

  /** Sets the refresh cookie and builds the frontend redirect URL carrying the access token. */
  googleCallback(user: UserDocument, res: Response): string {
    const payload = this.toPayload(user);
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    res.cookie(REFRESH_COOKIE, refreshToken, { httpOnly: true, sameSite: 'strict' });

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const encodedUser = encodeURIComponent(JSON.stringify(user));
    return `${frontendUrl}?googleAuth=success&token=${accessToken}&user=${encodedUser}`;
  }
}
