import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

type RedisClient = ReturnType<typeof createClient>;

const OUTAGE_LOG_INTERVAL_MS = 60_000;

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: RedisClient;
  private lastOutageLog = 0;

  constructor(configService: ConfigService) {
    this.client = createClient({
      url: configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379',
      // Without this, commands queue up while disconnected and never settle.
      disableOfflineQueue: true,
    });
    this.client.on('error', (error) => this.noteOutage(error));
  }

  onModuleInit(): void {
    this.client
      .connect()
      .then(() => this.logger.log('Redis connected!'))
      .catch((error) => this.logger.error(`Redis connect failed: ${error}`));
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.isOpen) await this.client.quit();
  }

  async get(key: string): Promise<string | null> {
    return this.run(() => this.client.get(key), null);
  }

  async setEx(key: string, ttlSeconds: number, value: string): Promise<void> {
    await this.run<unknown>(
      () => this.client.setEx(key, ttlSeconds, value),
      null,
    );
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await this.run<unknown>(
      () => Promise.all(keys.map((key) => this.client.del(key))),
      null,
    );
  }

  async keys(pattern: string): Promise<string[]> {
    return this.run(() => this.client.keys(pattern), []);
  }

  async incr(key: string): Promise<number | null> {
    return this.run(() => this.client.incr(key), null);
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.run<unknown>(() => this.client.expire(key, ttlSeconds), null);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const cached = await this.get(key);
    if (!cached) return null;

    try {
      return JSON.parse(cached) as T;
    } catch {
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

  // The cache is an optimisation, never a dependency: if Redis is down the
  // caller gets `fallback` and reads from MongoDB instead.
  private async run<T>(command: () => Promise<T>, fallback: T): Promise<T> {
    if (!this.client.isReady) return fallback;
    try {
      return await command();
    } catch (error) {
      this.noteOutage(error);
      return fallback;
    }
  }

  private noteOutage(error: unknown): void {
    const now = Date.now();
    if (now - this.lastOutageLog < OUTAGE_LOG_INTERVAL_MS) return;
    this.lastOutageLog = now;
    this.logger.error(`Redis unavailable, serving without cache: ${error}`);
  }
}
