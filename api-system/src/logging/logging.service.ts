import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logging } from './entities/logging.entity';
import { GetManyBaseResponseDto } from 'src/common/dtos/get-many-base.dto';
import { getManyResponse } from 'src/common/dtos/get-many-response';
import { MembersService } from 'src/modules/members/members.service';
import { FilterSearchLogDto } from './dto/logging.dto';
import { IMember } from 'src/common/interfaces/app.interface';

export interface ActionParams {
  memberId: string;
  action: string;
  context: string;
  status: 'SUCCESS' | 'FAILURE';
  details?: Record<string, any>;
}

@Injectable()
export class LoggingService {
  constructor(
    @InjectRepository(Logging)
    private readonly loggingRepository: Repository<Logging>,
    private readonly membersService: MembersService,
  ) {}

  /**
   * Create log
   * @param params
   * @returns
   */
  async createLog(params: ActionParams): Promise<Logging> {
    return await this.loggingRepository.save(params);
  }

  /**
   * Get logs by member id
   * @param member
   * @param query
   * @returns
   */
  async getLogsByMemberId(
    member: IMember,
    query: FilterSearchLogDto,
  ): Promise<GetManyBaseResponseDto<Logging>> {
    const memberOther = await this.membersService.findOneById(query.memberId);

    // Check permission if trying to access other member's logs
    if (member.id !== query.memberId) {
      const hasPermission = await this.membersService.hasHigherPrivilegeThan(
        member,
        memberOther,
      );
      if (!hasPermission) {
        throw new BadRequestException(
          'You do not have permission to view this log',
        );
      }
    }

    const { page, limit, sortOrder, search, status, date } = query;
    let { sortBy } = query;

    // Validate sortBy field
    if (!(sortBy in Logging)) {
      sortBy = 'createdAt';
    }

    // Create query builder
    const queryBuilder = this.loggingRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.member', 'member')
      .where('log.memberId = :memberId', { memberId: query.memberId });

    // Apply search filter
    if (search && search.trim()) {
      queryBuilder.andWhere(
        `(
          to_tsvector('simple', COALESCE(log.action, '')) ||
          to_tsvector('simple', COALESCE(log.context, '')) ||
          to_tsvector('simple', COALESCE(log.status, ''))
        ) @@ plainto_tsquery('simple', :searchTerm)`,
        { searchTerm: search.trim() },
      );
    }

    // Apply status filter
    if (status) {
      queryBuilder.andWhere('log.status = :status', { status });
    }

    // Apply date filter
    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setDate(endOfDay.getDate() + 1);

      queryBuilder.andWhere(
        'log.createdAt >= :startDate AND log.createdAt < :endDate',
        {
          startDate: startOfDay,
          endDate: endOfDay,
        },
      );
    }

    // Get total count before pagination
    const total = await queryBuilder.getCount();

    // Apply sorting and pagination
    const data = await queryBuilder
      .orderBy(`log.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return getManyResponse(query, data, total);
  }
}
