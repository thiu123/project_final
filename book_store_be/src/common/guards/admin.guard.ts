import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { RequestWithUser } from '../interfaces/jwt-payload.interface';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class AdminGuard extends JwtAuthGuard {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = this.authenticate(request);

    if (user.admin || request.params.id === user.id) return true;

    throw new ForbiddenException({
      msg: 'You do not have permission to do this',
    });
  }
}
