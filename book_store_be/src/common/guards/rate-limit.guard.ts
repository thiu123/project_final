import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { RateLimitService } from '../services/rate-limit.service';

export const RATE_LIMIT_KEY = 'rateLimit';

export interface RateLimitOptions {
  name: string;
  limit: number;
  windowSeconds: number;
}

function describeWait(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds`;
  const minutes = Math.ceil(seconds / 60);
  return minutes === 1 ? '1 minute' : `${minutes} minutes`;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimit: RateLimitService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.get<RateLimitOptions | undefined>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );
    if (!options) return true;

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const result = await this.rateLimit.consume(
      `${options.name}:${request.ip ?? 'unknown'}`,
      options.limit,
      options.windowSeconds,
    );
    if (result.allowed) return true;

    http
      .getResponse<Response>()
      .setHeader('Retry-After', String(result.retryAfter));
    const msg = `Too many attempts. Please try again in ${describeWait(result.retryAfter)}.`;
    throw new HttpException(
      { msg, message: msg },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
