import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

type RedisClient = ReturnType<typeof createClient>;

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: RedisClient;

  constructor(configService: ConfigService) {
    this.client = createClient({
      url: configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379',
    });
    this.client.on('error', (err) => this.logger.error(`Redis Error: ${err}`));
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

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async setEx(key: string, ttlSeconds: number, value: string): Promise<void> {
    await this.client.setEx(key, ttlSeconds, value);
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await Promise.all(keys.map((key) => this.client.del(key)));
  }

  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const cached = await this.get(key);
    return cached ? (JSON.parse(cached) as T) : null;
  }

  async setJson(key: string, ttlSeconds: number, value: unknown): Promise<void> {
    await this.setEx(key, ttlSeconds, JSON.stringify(value));
  }
}
