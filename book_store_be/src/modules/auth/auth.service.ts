import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
const RESET_TOKEN_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await new this.userModel({
      username: dto.username,
      email: dto.email,
      password: await this.hashPassword(dto.password),
    }).save();

    return this.sanitize(user);
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.userModel.findOne({ username: dto.username });
    if (!user) {
      throw new BadRequestException({ msg: 'User not found' });
    }

    const validPassword = await bcrypt.compare(
      dto.password,
      user.password ?? '',
    );
    if (!validPassword) {
      throw new BadRequestException({ msg: 'Invalid password' });
    }

    const payload = this.toPayload(user);
    this.setRefreshCookie(res, this.generateRefreshToken(payload));

    return {
      msg: 'Login successful',
      accessToken: this.generateAccessToken(payload),
      ...this.sanitize(user),
    };
  }

  refresh(refreshToken: string | undefined, res: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException({ msg: 'You are not authenticated' });
    }

    let decoded: JwtPayload;
    try {
      decoded = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_KEY'),
      });
    } catch {
      throw new ForbiddenException({ msg: 'Refresh token is not valid' });
    }

    const payload = this.toPayload(decoded);
    this.setRefreshCookie(res, this.generateRefreshToken(payload));

    return { accessToken: this.generateAccessToken(payload) };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException({ msg: 'User not found' });
    }

    const isMatch = await bcrypt.compare(
      dto.currentPassword,
      user.password ?? '',
    );
    if (!isMatch) {
      throw new BadRequestException({ msg: 'Invalid current password' });
    }

    user.password = await this.hashPassword(dto.newPassword);
    await user.save();

    return { msg: 'Password changed successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) {
      throw new NotFoundException({ msg: 'User not found with this email' });
    }

    if (!user.password) {
      throw new BadRequestException({
        msg: 'This account uses Google login. Please use Google to sign in.',
      });
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
    const user = await this.userModel.findOne({
      resetPasswordToken: this.hashResetToken(dto.token),
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException({ msg: 'Invalid or expired reset token' });
    }

    user.password = await this.hashPassword(dto.newPassword);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return { msg: 'Password reset successfully' };
  }

  async validateGoogleUser(profile: Profile): Promise<UserDocument> {
    const photo = profile.photos?.[0]?.value;
    const user = await this.userModel.findOne({ googleId: profile.id });

    if (!user) {
      return new this.userModel({
        username: profile.displayName,
        googleId: profile.id,
        email: profile.emails?.[0]?.value,
        avatar_url: photo,
      }).save();
    }

    // Google mints a new photo URL on every change and drops the old one,
    // so it has to be refreshed at each sign-in.
    if (photo && user.avatar_url !== photo) {
      user.avatar_url = photo;
      await user.save();
    }

    return user;
  }

  googleCallback(user: UserDocument, res: Response): string {
    const payload = this.toPayload(user);
    const accessToken = this.generateAccessToken(payload);

    res.cookie(REFRESH_COOKIE, this.generateRefreshToken(payload), {
      httpOnly: true,
      sameSite: 'strict',
    });

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const encodedUser = encodeURIComponent(JSON.stringify(user));
    return `${frontendUrl}?googleAuth=success&token=${accessToken}&user=${encodedUser}`;
  }

  private generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_KEY'),
      expiresIn: ACCESS_TOKEN_TTL,
    });
  }

  private generateRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_KEY'),
      expiresIn: REFRESH_TOKEN_TTL,
    });
  }

  private setRefreshCookie(res: Response, refreshToken: string): void {
    res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);
  }

  private toPayload(user: {
    id?: unknown;
    _id?: unknown;
    admin: boolean;
  }): JwtPayload {
    return { id: String(user.id ?? user._id), admin: user.admin };
  }

  private sanitize(user: UserDocument) {
    const { password, resetPasswordToken, resetPasswordExpires, ...safe } =
      user.toObject();
    return safe;
  }

  private hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }

  private hashResetToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
