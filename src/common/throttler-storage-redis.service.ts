import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
import Redis from 'ioredis';

@Injectable()
export class ThrottlerStorageRedisService implements ThrottlerStorage, OnModuleDestroy {
    private redis: Redis;

    constructor(redisOrUrl: Redis | string) {
        if (typeof redisOrUrl === 'string') {
            this.redis = new Redis(redisOrUrl);
        } else {
            this.redis = redisOrUrl;
        }
    }

    async increment(key: string, ttl: number): Promise<ThrottlerStorageRecord> {
        const script = `
      local hits = redis.call('INCR', KEYS[1])
      if hits == 1 then
        redis.call('PEXPIRE', KEYS[1], ARGV[1])
      end
      return { hits, redis.call('PTTL', KEYS[1]) }
    `;

        // ttl is in milliseconds in v6 (check NestJS docs if v5 is seconds)
        // Assuming v6 which uses milliseconds by default for TTL.
        const result = (await this.redis.eval(script, 1, key, ttl)) as [number, number];

        if (!result) {
            throw new Error(`Unable to verify throtler storage for key: ${key}`);
        }

        const [hits, timeToExpire] = result;

        return {
            totalHits: hits,
            timeToExpire: Math.ceil(timeToExpire / 1000), // Convert back to seconds if needed, or keep ms depending on interface
            isBlocked: false,
            timeToBlockExpire: 0,
        };
    }

    onModuleDestroy() {
        this.redis.disconnect();
    }
}
