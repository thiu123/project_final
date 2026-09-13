import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import {
  JwtPayload,
  RequestWithUser,
} from '../interfaces/jwt-payload.interface';

// Reads the JWT payload that JwtAuthGuard / AdminGuard put on the request.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload =>
    ctx.switchToHttp().getRequest<RequestWithUser>().user,
);
