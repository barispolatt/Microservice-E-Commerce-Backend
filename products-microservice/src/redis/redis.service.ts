import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;

    constructor(private readonly configService: ConfigService) {}

    onModuleInit() {
        this.client = new Redis({
            host: this.configService.get<string>('REDIS_HOST'),
            port: this.configService.get<number>('REDIS_PORT'),
        });
        console.log('Connected to Redis');
    }

    onModuleDestroy() {
        this.client.disconnect();
    }

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

    async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    // FIX: Added method to delete keys based on a prefix pattern.
    async delWithPrefix(prefix: string): Promise<void> {
        const keys = await this.client.keys(`${prefix}*`);
        if (keys.length > 0) {
            await this.client.del(keys);
        }
    }
}