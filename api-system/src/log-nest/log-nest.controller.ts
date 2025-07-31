import { Controller } from '@nestjs/common';
import { LogNestService } from './log-nest.service';
import { ApiTags } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { Get, Query } from '@nestjs/common';
import { Member } from 'src/common/decorators/app.decorator';
import { IMember } from 'src/common/interfaces/app.interface';
import { FilterSearchLogDto } from './dto/log-nest.dto';
import { Doc } from 'src/common/doc/doc.decorator';
import { GetManyBaseResponseDto } from 'src/common/dtos/get-many-base.dto';
import { LogNest } from './entities/log-nest.entity';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Log')
@Controller('log-nest')
export class LogNestController {
  constructor(private readonly logNestService: LogNestService) {}

  @Doc({
    summary: 'Get logs by member id, Role: Member',
    description: 'Get logs by member id. Return a list of log objects',
    response: {
      serialization: GetManyBaseResponseDto<LogNest>,
    },
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  getLogs(@Member() member: IMember, @Query() query: FilterSearchLogDto) {
    return this.logNestService.getLogsByMemberId(member, query);
  }
}
