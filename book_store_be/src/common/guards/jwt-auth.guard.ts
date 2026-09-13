import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  JwtPayload,
  RequestWithUser,
} from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    protected readonly jwtService: JwtService,
    protected readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    this.authenticate(context.switchToHttp().getRequest<RequestWithUser>());
    return true;
  }

  protected authenticate(request: RequestWithUser): JwtPayload {
    const header = request.headers.token;
    const raw = Array.isArray(header) ? header[0] : header;

    if (!raw) {
      throw new UnauthorizedException({ msg: 'You are not authenticated' });
    }

    try {
      request.user = this.jwtService.verify<JwtPayload>(
        raw.replace('Bearer ', ''),
        { secret: this.configService.get<string>('JWT_ACCESS_KEY') },
      );
      return request.user;
    } catch {
      throw new ForbiddenException({ msg: 'Token is not valid' });
    }
  }
}
