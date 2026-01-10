import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from './throttler-storage-redis.service';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { UserThrottlerGuard } from './guards/user-throttler.guard';

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
              // Default global limit (Higher for general usage)
              name: 'default',
              ttl: 60000,
              limit: 100, // 100 requests per minute
            },
            {
              // Strict limit for Auth (Login/Register)
              name: 'auth',
              ttl: 60000,
              limit: 10, // 10 attempts per minute
            },
            {
              // Strict limit for AI Generation (Expensive)
              name: 'ai',
              ttl: 60000,
              limit: 20, // 20 requests per minute
            },
          ],
          storage: storage,
        };
      },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: UserThrottlerGuard, // Use custom guard
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

