import { Global, Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggingService } from './logging.service';
import { Logging } from './entities/logging.entity';
import { LoggingController } from './logging.controller';
import { MembersModule } from 'src/modules/members/members.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Logging]),
    forwardRef(() => MembersModule),
  ],
  controllers: [LoggingController],
  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggingModule {}
