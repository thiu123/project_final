import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, RequestWithUser } from '../interfaces/jwt-payload.interface';

/**
 * Port of `middlewareController.verifyToken`.
 * Reads the access token from the `token` header ("Bearer <jwt>").
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    protected readonly jwtService: JwtService,
    protected readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    this.authenticate(request);
    return true;
  }

  protected authenticate(request: RequestWithUser): JwtPayload {
    const header = request.headers.token;
    const token = Array.isArray(header) ? header[0] : header;

    if (!token) {
      throw new HttpException('You are not authenticated', HttpStatus.UNAUTHORIZED);
    }

    const accessToken = token.split(' ')[1];
    try {
      const payload = this.jwtService.verify<JwtPayload>(accessToken, {
        secret: this.configService.get<string>('JWT_ACCESS_KEY'),
      });
      request.user = payload;
      return payload;
    } catch {
      throw new HttpException('Token is not valid', HttpStatus.FORBIDDEN);
    }
  }
}
