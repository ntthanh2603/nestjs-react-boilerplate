import { Controller } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { ApiTags } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { Get, Query } from '@nestjs/common';
import { Member } from 'src/common/decorators/app.decorator';
import { IMember } from 'src/common/interfaces/app.interface';
import { FilterSearchLogDto } from './dto/logging.dto';
import { Doc } from 'src/common/doc/doc.decorator';
import { GetManyBaseResponseDto } from 'src/common/dtos/get-many-base.dto';
import { Logging } from './entities/logging.entity';

@ApiTags('Log')
@Controller('logging')
export class LoggingController {
  constructor(private readonly loggingService: LoggingService) {}

  @Doc({
    summary: 'Get logs by member id, Role: Member',
    description: 'Get logs by member id. Return a list of log objects',
    response: {
      serialization: GetManyBaseResponseDto<Logging>,
    },
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  getLogs(@Member() member: IMember, @Query() query: FilterSearchLogDto) {
    return this.loggingService.getLogsByMemberId(member, query);
  }
}
