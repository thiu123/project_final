import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../config/redis/redis.service';

export interface RateLimitResult {
  allowed: boolean;
  retryAfter: number;
}

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

    // Redis down: fail open so the feature keeps working without a limit.
    const used = await this.redis.incr(redisKey);
    if (used === null) {
      this.logger.warn('Rate limit not enforced: Redis unavailable');
      return { allowed: true, retryAfter: 0 };
    }

    if (used === 1) await this.redis.expire(redisKey, windowSeconds);

    const resetAt = (window + 1) * windowSeconds;
    return {
      allowed: used <= limit,
      retryAfter: Math.max(1, resetAt - Math.floor(Date.now() / 1000)),
    };
  }
}
