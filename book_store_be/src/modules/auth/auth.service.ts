import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
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
import { RateLimitService } from '../../common/services/rate-limit.service';
import { MailService } from '../../config/mail/mail.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto/auth.dto';

const REFRESH_COOKIE = 'refreshToken';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
const RESET_TOKEN_TTL_MS = 10 * 60 * 1000;
const RESET_EMAILS_PER_HOUR = 3;

const FORGOT_PASSWORD_RESPONSE = {
  msg: 'If an account exists for this email, a password reset link has been sent.',
};

const DUMMY_PASSWORD_HASH = bcrypt.hashSync(
  crypto.randomBytes(16).toString('hex'),
  10,
);

interface RefreshPayload {
  id: string;
  tv: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly refreshCookieOptions: CookieOptions;
  private readonly frontendUrl: string;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly rateLimit: RateLimitService,
  ) {
    const isProduction = configService.get<string>('NODE_ENV') === 'production';
    this.refreshCookieOptions = {
      httpOnly: true,
      path: '/',
      sameSite: isProduction ? 'none' : 'strict',
      secure: isProduction,
      maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
    };
    this.frontendUrl = (
      configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000'
    ).replace(/\/$/, '');
  }

  async register(dto: RegisterDto) {
    const taken = await this.userModel
      .findOne({ $or: [{ email: dto.email }, { username: dto.username }] })
      .select('email')
      .lean();
    if (taken) {
      throw this.registrationConflict(
        taken.email === dto.email ? 'email' : 'username',
      );
    }

    try {
      const user = await new this.userModel({
        username: dto.username,
        email: dto.email,
        password: await this.hashPassword(dto.password),
      }).save();
      return this.sanitize(user);
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw this.registrationConflict('email');
      }
      throw error;
    }
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.userModel
      .findOne({ username: dto.username })
      .select('+password +tokenVersion');

    const validPassword = await bcrypt.compare(
      dto.password,
      user?.password ?? DUMMY_PASSWORD_HASH,
    );
    if (!user?.password || !validPassword) {
      throw new BadRequestException({ msg: 'Invalid username or password' });
    }

    this.issueRefreshCookie(res, user);

    return {
      msg: 'Login successful',
      accessToken: this.generateAccessToken(user),
      ...this.sanitize(user),
    };
  }

  async refresh(refreshToken: string | undefined, res: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException({ msg: 'You are not authenticated' });
    }

    let decoded: RefreshPayload;
    try {
      decoded = this.jwtService.verify<RefreshPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_KEY'),
      });
    } catch {
      this.clearRefreshCookie(res);
      throw new UnauthorizedException({ msg: 'Refresh token is not valid' });
    }

    const user = await this.userModel
      .findById(decoded.id)
      .select('+tokenVersion');
    if (!user || (user.tokenVersion ?? 0) !== decoded.tv) {
      this.clearRefreshCookie(res);
      throw new UnauthorizedException({
        msg: 'Your session has expired. Please log in again.',
      });
    }

    this.issueRefreshCookie(res, user);

    return { accessToken: this.generateAccessToken(user) };
  }

  logout(res: Response) {
    this.clearRefreshCookie(res);
    return { msg: 'Logged out' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto, res: Response) {
    const user = await this.userModel
      .findById(userId)
      .select('+password +tokenVersion');
    if (!user) {
      throw new BadRequestException({ msg: 'User not found' });
    }

    const isMatch = await bcrypt.compare(
      dto.currentPassword,
      user.password ?? DUMMY_PASSWORD_HASH,
    );
    if (!user.password || !isMatch) {
      throw new BadRequestException({ msg: 'Invalid current password' });
    }

    user.password = await this.hashPassword(dto.newPassword);
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();

    this.issueRefreshCookie(res, user);

    return {
      msg: 'Password changed successfully',
      accessToken: this.generateAccessToken(user),
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const quota = await this.rateLimit.consume(
      `forgot-password-email:${dto.email.toLowerCase()}`,
      RESET_EMAILS_PER_HOUR,
      60 * 60,
    );
    if (!quota.allowed) return FORGOT_PASSWORD_RESPONSE;

    const user = await this.userModel
      .findOne({ email: dto.email })
      .select('+password');

    if (user) {
      this.sendPasswordHelp(user).catch((error: Error) =>
        this.logger.error(
          `Password reset for ${user.email} failed: ${error.message}`,
        ),
      );
    }

    return FORGOT_PASSWORD_RESPONSE;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userModel
      .findOne({
        resetPasswordToken: this.hashResetToken(dto.token),
        resetPasswordExpires: { $gt: new Date() },
      })
      .select('+tokenVersion');

    if (!user) {
      throw new BadRequestException({ msg: 'Invalid or expired reset link' });
    }

    user.password = await this.hashPassword(dto.newPassword);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();

    return { msg: 'Password reset successfully' };
  }

  async validateGoogleUser(profile: Profile): Promise<UserDocument> {
    const photo = profile.photos?.[0]?.value;
    const user = await this.userModel
      .findOne({ googleId: profile.id })
      .select('+tokenVersion');

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
    const accessToken = this.generateAccessToken(user);
    this.issueRefreshCookie(res, user);

    const encodedUser = encodeURIComponent(JSON.stringify(this.sanitize(user)));
    return `${this.frontendUrl}?googleAuth=success&token=${accessToken}&user=${encodedUser}`;
  }

  private async sendPasswordHelp(user: UserDocument): Promise<void> {
    if (!user.password) {
      await this.mailService.send({
        to: user.email,
        subject: 'THBookStore: sign in with Google',
        text: `Someone asked to reset the password for this THBookStore account.\n\nThis account signs in with Google and has no password. Use "Continue with Google" on the login page: ${this.frontendUrl}/login\n\nIf you did not ask for this, you can ignore this email.`,
      });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = this.hashResetToken(resetToken);
    user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await user.save();

    const link = `${this.frontendUrl}/reset-password?token=${resetToken}`;
    const minutes = RESET_TOKEN_TTL_MS / 60000;
    await this.mailService.send({
      to: user.email,
      subject: 'THBookStore: reset your password',
      text: `Someone asked to reset the password for your THBookStore account.\n\nOpen this link within ${minutes} minutes to choose a new password:\n${link}\n\nIf you did not ask for this, you can ignore this email. Your password will not change.`,
      html: `<p>Someone asked to reset the password for your THBookStore account.</p><p><a href="${link}">Choose a new password</a> (the link expires in ${minutes} minutes).</p><p>If you did not ask for this, you can ignore this email. Your password will not change.</p>`,
    });
  }

  private registrationConflict(field: 'email' | 'username') {
    return new ConflictException({
      msg:
        field === 'email'
          ? 'An account with this email already exists'
          : 'This username is already taken',
      field,
    });
  }

  private generateAccessToken(user: UserDocument): string {
    const payload: JwtPayload = { id: user.id as string, admin: user.admin };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_KEY'),
      expiresIn: ACCESS_TOKEN_TTL,
    });
  }

  private issueRefreshCookie(res: Response, user: UserDocument): void {
    const payload: RefreshPayload = {
      id: user.id as string,
      tv: user.tokenVersion ?? 0,
    };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_KEY'),
      expiresIn: REFRESH_TOKEN_TTL_SECONDS,
    });
    res.cookie(REFRESH_COOKIE, token, this.refreshCookieOptions);
  }

  private clearRefreshCookie(res: Response): void {
    const { maxAge, ...options } = this.refreshCookieOptions;
    res.clearCookie(REFRESH_COOKIE, options);
  }

  private sanitize(user: UserDocument) {
    const {
      password,
      resetPasswordToken,
      resetPasswordExpires,
      tokenVersion,
      ...safe
    } = user.toObject();
    return safe;
  }

  private hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }

  private hashResetToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
