import { Global, Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogNestService } from './log-nest.service';
import { LogNest } from './entities/log-nest.entity';
import { LogNestController } from './log-nest.controller';
import { MembersModule } from 'src/modules/members/members.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([LogNest]),
    forwardRef(() => MembersModule),
  ],
  controllers: [LogNestController],
  providers: [LogNestService],
  exports: [LogNestService],
})
export class LogNestModule {}
