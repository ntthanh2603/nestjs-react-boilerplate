import { Module, forwardRef } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Members } from './entities/member.entity';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from 'src/redis/redis.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ImagesModule } from 'src/images/images.module';
import { LoggingModule } from 'src/logging/logging.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Members]),
    forwardRef(() => AuthModule),
    RedisModule,
    MailerModule,
    ImagesModule,
    forwardRef(() => LoggingModule),
  ],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
