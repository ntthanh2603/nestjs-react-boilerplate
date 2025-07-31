import { Global, Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import { Redis } from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT' as const;

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: configService.get<number>('REDIS_PORT') || 6379,
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
          db: configService.get<number>('REDIS_DB') || 0,
          keyPrefix: configService.get<string>('REDIS_KEY_PREFIX') || '',
          tls: configService.get<boolean>('REDIS_TLS') ? {} : undefined,
          maxRetriesPerRequest: null,
        });
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule implements OnModuleInit {
  onModuleInit() {
    Logger.log('RedisModule initialized', RedisModule.name);
  }
}
