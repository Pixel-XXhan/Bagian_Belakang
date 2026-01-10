import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from './throttler-storage-redis.service';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';

@Global()
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get<string>('REDIS_URL');
        const storage = redisUrl ? new ThrottlerStorageRedisService(redisUrl) : undefined;

        if (!redisUrl) {
          console.warn('⚠️ REDIS_URL not found. Falling back to In-Memory Rate Limiting.');
        }

        return {
          throttlers: [
            {
              name: 'short',
              ttl: 1000,
              limit: 3,
            },
            {
              name: 'medium',
              ttl: 10000,
              limit: 20,
            },
            {
              name: 'long',
              ttl: 60000,
              limit: 100,
            },
          ],
          storage: storage, // If undefined, Throttler uses default memory storage
        };
      },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
  exports: [],
})
export class CommonModule { }
