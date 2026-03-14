import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly config;
    private readonly logger;
    private client;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    del(...keys: string[]): Promise<void>;
    exists(key: string): Promise<boolean>;
    ttl(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<void>;
    incr(key: string): Promise<number>;
    incrBy(key: string, by: number): Promise<number>;
    hset(key: string, field: string, value: string): Promise<void>;
    hget(key: string, field: string): Promise<string | null>;
    hgetall(key: string): Promise<Record<string, string>>;
    hdel(key: string, ...fields: string[]): Promise<void>;
    hmset(key: string, data: Record<string, string>): Promise<void>;
    sadd(key: string, ...members: string[]): Promise<void>;
    srem(key: string, ...members: string[]): Promise<void>;
    smembers(key: string): Promise<string[]>;
    publish(channel: string, message: string): Promise<void>;
    /**
     * Creates a DUPLICATE connection for subscriptions
     * (ioredis subscriber clients must be dedicated connections)
     */
    createSubscriberClient(): Redis;
    getJson<T>(key: string): Promise<T | null>;
    setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
    /** Key for OTP rate limit / attempt tracking */
    otpKey(phone: string): string;
    /** Key for OTP attempt counter */
    otpAttemptsKey(phone: string): string;
    /** Key for OTP lock */
    otpLockKey(phone: string): string;
    refreshTokenKey(userId: string): string;
    /** Daily ticket counter key for a shop */
    ticketCounterKey(shopId: string, date: string): string;
    /** Live queue state for a shop/branch/barber */
    queueStateKey(shopId: string, branchId?: string, barberId?: string): string;
}
