import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import {
  RATE_LIMIT_KEY,
  RateLimitGuard,
  RateLimitOptions,
} from '../guards/rate-limit.guard';

export const RateLimit = (options: RateLimitOptions) =>
  applyDecorators(
    SetMetadata(RATE_LIMIT_KEY, options),
    UseGuards(RateLimitGuard),
  );
