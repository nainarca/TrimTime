import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    this.client = new Redis(
      this.config.get<string>('REDIS_URL', 'redis://localhost:6379'),
      { lazyConnect: true },
    );
    this.client.on('connect', () => this.logger.log('Redis connected'));
    this.client.on('error', (err) =>
      this.logger.error('Redis error', err.message),
    );
    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.quit();
    this.logger.log('Redis disconnected');
  }

  // ── Core ops ──────────────────────────────────────────────────────────────

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(...keys: string[]): Promise<void> {
    await this.client.del(...keys);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  // ── Counter ops ───────────────────────────────────────────────────────────

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async incrBy(key: string, by: number): Promise<number> {
    return this.client.incrby(key, by);
  }

  // ── Hash ops ──────────────────────────────────────────────────────────────

  async hset(key: string, field: string, value: string): Promise<void> {
    await this.client.hset(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.client.hgetall(key);
  }

  async hdel(key: string, ...fields: string[]): Promise<void> {
    await this.client.hdel(key, ...fields);
  }

  async hmset(key: string, data: Record<string, string>): Promise<void> {
    await this.client.hmset(key, data);
  }

  // ── Set ops ───────────────────────────────────────────────────────────────

  async sadd(key: string, ...members: string[]): Promise<void> {
    await this.client.sadd(key, ...members);
  }

  async srem(key: string, ...members: string[]): Promise<void> {
    await this.client.srem(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    return this.client.smembers(key);
  }

  // ── Publish / Subscribe (for queue pub-sub notifications) ─────────────────

  async publish(channel: string, message: string): Promise<void> {
    await this.client.publish(channel, message);
  }

  /**
   * Creates a DUPLICATE connection for subscriptions
   * (ioredis subscriber clients must be dedicated connections)
   */
  createSubscriberClient(): Redis {
    return this.client.duplicate();
  }

  // ── JSON helpers ──────────────────────────────────────────────────────────

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttlSeconds);
  }

  // ── OTP helpers ───────────────────────────────────────────────────────────

  /** Key for OTP rate limit / attempt tracking */
  otpKey(phone: string): string {
    return `otp:${phone}`;
  }

  /** Key for OTP attempt counter */
  otpAttemptsKey(phone: string): string {
    return `otp:attempts:${phone}`;
  }

  /** Key for OTP lock */
  otpLockKey(phone: string): string {
    return `otp:lock:${phone}`;
  }

  // ── Session helpers ───────────────────────────────────────────────────────

  refreshTokenKey(userId: string): string {
    return `refresh:${userId}`;
  }

  // ── Queue helpers ─────────────────────────────────────────────────────────

  /** Daily ticket counter key for a shop */
  ticketCounterKey(shopId: string, date: string): string {
    // include shopId to avoid cross-tenant conflicts
    return `ticket_counter:${shopId}:${date}`;
  }

  /**
   * Dedup key for NEXT_IN_LINE notifications.
   * Set atomically via SETNX; auto-expires after `ttlSeconds` so a re-queued
   * customer can be notified again on their next visit.
   *
   * Returns true if this is the first notification (caller should emit),
   * false if a notification was already sent within the TTL window.
   */
  async claimNextInLineNotif(entryId: string, ttlSeconds = 600): Promise<boolean> {
    // SET NX EX — only sets if key does not exist
    const result = await this.client.set(
      `notif:next:${entryId}`, '1', 'EX', ttlSeconds, 'NX',
    );
    return result === 'OK';
  }

  /** Clear the NEXT_IN_LINE dedup key when the entry advances past position 1. */
  async clearNextInLineNotif(entryId: string): Promise<void> {
    await this.del(`notif:next:${entryId}`);
  }

  /** Live queue state for a shop/branch/barber */
  queueStateKey(shopId: string, branchId?: string, barberId?: string): string {
    if (branchId) {
      return barberId
        ? `queue:${shopId}:branch:${branchId}:barber:${barberId}`
        : `queue:${shopId}:branch:${branchId}`;
    }
    return barberId
      ? `queue:${shopId}:barber:${barberId}`
      : `queue:${shopId}`;
  }
}
