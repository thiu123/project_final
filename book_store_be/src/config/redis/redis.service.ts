import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

type RedisClient = ReturnType<typeof createClient>;

/** How often to log that Redis is still unreachable, so the log is not flooded. */
const OUTAGE_LOG_INTERVAL_MS = 60_000;

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: RedisClient;
  private lastOutageLog = 0;

  constructor(configService: ConfigService) {
    this.client = createClient({
      url: configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379',
      // Without this the client queues commands while disconnected and the
      // promises never settle, so every cached endpoint hangs instead of
      // falling through to MongoDB.
      disableOfflineQueue: true,
    });
    this.client.on('error', (err) => this.noteOutage(err));
  }

  onModuleInit(): void {
    // Connect in the background (like the Express version) so a Redis outage
    // does not prevent the API from booting.
    this.client
      .connect()
      .then(() => this.logger.log('Redis connected!'))
      .catch((err) => this.logger.error(`Redis connect failed: ${err}`));
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.isOpen) await this.client.quit();
  }

  /** Redis errors fire per reconnection attempt; log at most once a minute. */
  private noteOutage(error: unknown): void {
    const now = Date.now();
    if (now - this.lastOutageLog < OUTAGE_LOG_INTERVAL_MS) return;
    this.lastOutageLog = now;
    this.logger.error(`Redis unavailable, serving without cache: ${error}`);
  }

  /**
   * Runs a command, degrading to `fallback` if Redis is down.
   *
   * The cache is an optimisation, never a dependency: a Redis outage must cost
   * latency, not availability.
   */
  private async safe<T>(run: () => Promise<T>, fallback: T): Promise<T> {
    if (!this.client.isReady) return fallback;
    try {
      return await run();
    } catch (error) {
      this.noteOutage(error);
      return fallback;
    }
  }

  async get(key: string): Promise<string | null> {
    return this.safe(() => this.client.get(key), null);
  }

  async setEx(key: string, ttlSeconds: number, value: string): Promise<void> {
    await this.safe(() => this.client.setEx(key, ttlSeconds, value), undefined);
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await this.safe(
      () => Promise.all(keys.map((key) => this.client.del(key))),
      [],
    );
  }

  async keys(pattern: string): Promise<string[]> {
    return this.safe(() => this.client.keys(pattern), []);
  }

  /**
   * Atomically increments a counter and returns the new value, or `null` when
   * Redis is unavailable. Callers that meter something must decide for
   * themselves whether to fail open or closed.
   */
  async incr(key: string): Promise<number | null> {
    return this.safe(() => this.client.incr(key), null);
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.safe(() => this.client.expire(key, ttlSeconds), 0);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const cached = await this.get(key);
    if (!cached) return null;
    try {
      return JSON.parse(cached) as T;
    } catch {
      // A corrupt entry should read as a miss, not poison the endpoint.
      this.logger.warn(`Discarding unparseable cache entry: ${key}`);
      await this.del(key);
      return null;
    }
  }

  async setJson(
    key: string,
    ttlSeconds: number,
    value: unknown,
  ): Promise<void> {
    await this.setEx(key, ttlSeconds, JSON.stringify(value));
  }
}
