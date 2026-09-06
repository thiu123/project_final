import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../config/redis/redis.service';

export interface RateLimitResult {
  allowed: boolean;
  /** Requests still available in the current window. */
  remaining: number;
  /** Seconds until the window resets. Only meaningful when `allowed` is false. */
  retryAfter: number;
}

/**
 * Fixed-window counter in Redis.
 *
 * Fixed windows can let through up to twice the limit across a window
 * boundary. That is acceptable here — the point is to stop one user from
 * draining a shared API quota, not to meter billing precisely — and it costs a
 * single INCR instead of the sorted-set bookkeeping a sliding window needs.
 */
@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);

  constructor(private readonly redis: RedisService) {}

  async consume(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<RateLimitResult> {
    const window = Math.floor(Date.now() / 1000 / windowSeconds);
    const redisKey = `ratelimit:${key}:${window}`;

    let used: number;
    try {
      used = await this.redis.incr(redisKey);
      // Only the first caller needs to set the expiry; re-setting it on every
      // hit would slide the window forward and never let it reset.
      if (used === 1) await this.redis.expire(redisKey, windowSeconds);
    } catch (error) {
      // Redis being down must not take the feature offline with it.
      this.logger.warn(`Rate limit check skipped: ${(error as Error).message}`);
      return { allowed: true, remaining: limit, retryAfter: 0 };
    }

    const resetAt = (window + 1) * windowSeconds;
    return {
      allowed: used <= limit,
      remaining: Math.max(0, limit - used),
      retryAfter: Math.max(1, resetAt - Math.floor(Date.now() / 1000)),
    };
  }
}
