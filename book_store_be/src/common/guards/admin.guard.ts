import { ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RequestWithUser } from '../interfaces/jwt-payload.interface';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * Port of `middlewareController.verifyTokenAndAdmin`.
 * Allows the request when the caller is an admin OR when the `:id` route param
 * equals the caller's own id (e.g. a user deleting their own account).
 */
@Injectable()
export class AdminGuard extends JwtAuthGuard {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = this.authenticate(request);

    if (request.params.id === user.id || user.admin) {
      return true;
    }
    throw new HttpException("You can't delete this user", HttpStatus.FORBIDDEN);
  }
}
