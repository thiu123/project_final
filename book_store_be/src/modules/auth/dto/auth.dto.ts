import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Trim } from '../../../common/decorators/trim.decorator';

const PASSWORD_RULE = { message: 'Password must be at least 6 characters' };

export class RegisterDto {
  @Trim()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @Trim()
  @IsEmail({}, { message: 'A valid email is required' })
  email: string;

  @IsString()
  @MinLength(6, PASSWORD_RULE)
  password: string;
}

export class LoginDto {
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword: string;

  @IsString()
  @MinLength(6, PASSWORD_RULE)
  newPassword: string;
}

export class ForgotPasswordDto {
  @Trim()
  @IsEmail({}, { message: 'Email is required' })
  email: string;
}

export class ResetPasswordDto {
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'Reset token is required' })
  token: string;

  @IsString()
  @MinLength(6, PASSWORD_RULE)
  newPassword: string;
}
