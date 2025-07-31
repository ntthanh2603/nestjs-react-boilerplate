import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Members } from './entities/member.entity';
import {
  SignInMemberStep1Dto,
  SignInMemberStep2Dto,
  BanMemberDto,
  UpdateMySettingDto,
  UpdateRoleDto,
} from './dto/member.dto';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RoleMember } from 'src/common/enums/enum';
import { AuthService } from '../auth/auth.service';
import { LoginMetadata } from 'src/common/interfaces/login.interface';
import { RedisService } from 'src/redis/redis.service';
import { MailerService } from '@nestjs-modules/mailer';
import { v4 as uuidv4 } from 'uuid';
import * as randomatic from 'randomatic';
import { Response } from 'express';
import { IMember } from 'src/common/interfaces/app.interface';
import { GetManyBaseResponseDto } from 'src/common/dtos/get-many-base.dto';
import { FilterSearchMemberDto } from './dto/member.dto';
import { getManyResponse } from 'src/common/dtos/get-many-response';
import { OnModuleInit } from '@nestjs/common';
import { EXPIRED_REFRESH_TOKEN } from 'src/common/constants/app.constants';
import { ImagesService } from 'src/images/images.service';
import { Images } from 'src/images/entities/images.entity';

@Injectable()
export class MembersService implements OnModuleInit {
  constructor(
    @InjectRepository(Members)
    private readonly memberRepository: Repository<Members>,
    private readonly redisService: RedisService,
    private readonly authService: AuthService,
    private readonly mailService: MailerService,
    private readonly imagesService: ImagesService,
  ) {}

  onModuleInit() {
    this.signUpFirstAdmin();
  }

  /**
   * Sign up first admin
   *
   * @returns a default message response object
   */
  private async signUpFirstAdmin(): Promise<void> {
    const EMAIL_ADMIN_ROOT = process.env.EMAIL_ADMIN_ROOT;
    const PASSWORD_ADMIN_ROOT = process.env.PASSWORD_ADMIN_ROOT;

    const member = await this.memberRepository.count({
      where: { email: EMAIL_ADMIN_ROOT, roleMember: RoleMember.ADMIN },
    });
    if (member > 0) {
      return;
    }
    const salt = await bcrypt.genSalt();
    const id = uuidv4();
    const passwordHash = await this.hashPassword(PASSWORD_ADMIN_ROOT!, salt);
    await this.memberRepository.save({
      id,
      email: EMAIL_ADMIN_ROOT!,
      password: passwordHash,
      salt,
      fullName: 'Admin Root',
      description: 'Admin Root System',
      roleMember: RoleMember.ADMIN,
    });
  }

  /**
   * Hashes a password
   *
   * @param password the password to hash
   * @param salt the salt to use for hashing
   * @returns a promise resolving to the hashed password
   */
  async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }

  /**
   * Gets a member by the provided id
   *
   * @param id the id of the member
   * @returns a promise resolving to the member's data
   * @throws {UnauthorizedException} if the member is banned
   */
  public async findOneById(id: string): Promise<IMember> {
    let member: any = await this.redisService.hGetAll(`member:${id}`);
    if (!member || Object.keys(member).length === 0) {
      const memberDb = await this.memberRepository.findOne({
        where: { id },
        relations: ['image'],
      });
      member = { ...memberDb };
      const redisMember = { ...member };
      await this.redisService.hMSet(`member:${id}`, redisMember);

      await this.redisService.expire(`member:${id}`, 3600); // 1 hour

      const { password: _, salt: __, ...memberResponse } = member;

      if (memberResponse.idBanned) {
        throw new UnauthorizedException('Account is banned');
      }
      return {
        ...memberResponse,
      };
    } else {
      const { password: _, salt: __, ...memberResponse } = member;

      if (memberResponse.idBanned) {
        throw new UnauthorizedException('Account is banned');
      }

      return {
        ...memberResponse,
      };
    }
  }

  /**
   * Search full text members
   *
   * @param queryDto the query parameters
   * @returns a list of member objects
   */
  public async filterSearchMembers(
    queryDto: FilterSearchMemberDto,
  ): Promise<GetManyBaseResponseDto<Members>> {
    const {
      page = 1,
      limit = 10,
      search,
      roleMember,
      isBanned,
      sortOrder,
      sortBy,
    } = queryDto;

    // Build the base query
    const query = this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.image', 'image');

    // Apply search filter if provided
    if (search) {
      query.andWhere(
        '(member.fullName LIKE :search OR member.email LIKE :search OR member.phoneNumber LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply role filter if provided
    if (roleMember) {
      query.andWhere('member.roleMember = :roleMember', { roleMember });
    }

    // Apply boolean filters if provided
    if (isBanned !== undefined) {
      query.andWhere('member.isBanned = :isBanned', { isBanned });
    }

    // Apply sorting
    if (sortBy && sortOrder) {
      query.orderBy(`member.${sortBy}`, sortOrder as 'ASC' | 'DESC');
    }

    // Get total count for pagination
    const total = await query.getCount();

    // Apply pagination
    const skip = (page - 1) * limit;
    const members = await query.skip(skip).take(limit).getMany();

    return getManyResponse(
      {
        page,
        limit,
        sortBy: sortBy || 'createdAt',
        sortOrder,
      },
      members,
      total,
    );
  }

  /**
   * Sign up an admin
   *
   * @param dto the data transfer object with the admin's data
   * @returns a default message response object
   * @throws {ConflictException} if the email address is already used
   */
  public async updateRole(
    admin: IMember,
    dto: UpdateRoleDto,
  ): Promise<Members> {
    if (admin.email !== process.env.EMAIL_ADMIN_ROOT) {
      throw new UnauthorizedException(
        'You do not have permission to create an admin account',
      );
    }
    const member = await this.memberRepository.findOne({
      where: { id: dto.id },
    });
    if (!member) {
      throw new NotFoundException('Member is not found');
    }
    member.roleMember = dto.roleMember;
    return await this.memberRepository.save(member);
  }

  /**
   * Authenticate a member
   *
   * @param email the email address of the member
   * @param password the password of the member
   * @param roleMember the role of the member
   * @param require2FA whether 2FA is required
   * @returns the member object
   * @throws {UnauthorizedException} if the email or password is incorrect
   */
  private async authenticateMember(
    email: string,
    password: string,
    roleMember: RoleMember,
    require2FA: boolean = false,
  ) {
    let member: IMember | null = await this.memberRepository.findOne({
      where: { email, roleMember },
      relations: ['image'],
    });

    if (!member) {
      throw new NotFoundException('Account not found');
    }

    // If member not found or password is incorrect
    if (
      !member ||
      member.password !== (await this.hashPassword(password, member.salt!))
    ) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    // If 2FA is required but not enabled for the member
    if (require2FA && !member.is2FA) {
      throw new UnauthorizedException('2FA is not enabled');
    }

    return member;
  }

  /**
   * Handle successful authentication and create device session
   *
   * @param res the response object
   * @param member the member object
   * @param metaData the metadata object
   * @returns the login response object
   */
  private async handleSuccessfulAuth(
    res: Response,
    member: IMember,
    metaData: LoginMetadata,
  ) {
    const newDeviceSession = await this.authService.handleDeviceSession(
      member.id,
      member.roleMember,
      metaData,
    );

    const { password: _, salt: __, ...memberResponse } = member;

    res.cookie('refreshToken', newDeviceSession.refreshToken, {
      httpOnly: true,
      maxAge: EXPIRED_REFRESH_TOKEN * 24 * 60 * 60 * 1000, // milliseconds
    });

    return {
      token: newDeviceSession.token,
      expiredAt: newDeviceSession.expiredAt,
      member: memberResponse,
    };
  }

  /**
   * Sign in step 1
   *
   * @param res the response object
   * @param dto the data transfer object with the member's data
   * @param metaData the metadata object
   * @returns the login response object
   */
  public async signInStep1(
    res: Response,
    dto: SignInMemberStep1Dto,
    metaData: LoginMetadata,
  ) {
    const { email, password, roleMember } = dto;

    const member = await this.authenticateMember(
      email!,
      password,
      roleMember,
      false,
    );

    // If 2FA is enabled, send OTP
    if (member.is2FA) {
      const otp = randomatic('0', 6);
      await this.redisService.set(`otp:${email}`, otp, 2 * 60);

      await this.mailService.sendMail({
        to: email!,
        subject: 'Authentication account',
        template: 'send-otp-authentication',
        context: {
          otp,
          fullName: member.fullName,
        },
      });

      return { message: 'OTP has been sent to your email' };
    }

    // If 2FA is disabled, proceed with login
    return this.handleSuccessfulAuth(res, member, metaData);
  }

  /**
   * Sign in step 2
   *
   * @param res the response object
   * @param dto the data transfer object with the member's data
   * @param metaData the metadata object
   * @returns the login response object
   */
  public async signInStep2(
    res: Response,
    dto: SignInMemberStep2Dto,
    metaData: LoginMetadata,
  ) {
    const { email, password, roleMember, otp } = dto;

    // Verify OTP first
    const storedOtp = await this.redisService.get(`otp:${email}`);
    if (storedOtp !== otp) {
      throw new UnauthorizedException('OTP not correct');
    }

    // Verify credentials with 2FA required
    const member = await this.authenticateMember(
      email!,
      password,
      roleMember,
      true,
    );

    // Clear OTP after successful verification
    await this.redisService.del(`otp:${email}`);

    // Proceed with login
    return this.handleSuccessfulAuth(res, member, metaData);
  }

  /**
   * Update is banned member by Admin
   *
   * @param member the member object
   * @param dto the data transfer object with the is banned value
   * @returns a default message response object
   * @throws {NotFoundException} if the member is not found
   * @throws {BadRequestException} if the member does not have permission to change the target member
   */
  public async updateIsBanned(
    member: IMember,
    dto: BanMemberDto,
  ): Promise<void> {
    const { memberId, isBanned } = dto;

    const memberOther = await this.findOneById(memberId);
    if (!memberOther) {
      throw new NotFoundException('Account not found');
    }
    // Check if the current member has higher privilege than the target member
    const hasPermission = await this.hasHigherPrivilegeThan(
      member,
      memberOther,
    );

    if (!hasPermission) {
      throw new BadRequestException(
        'You do not have permission to change this account',
      );
    }

    await this.memberRepository.update({ id: memberId }, { isBanned });

    await this.redisService.del(`member:${memberId}`);
    return;
  }

  /**
   * Update my setting
   *
   * @param member the member object
   * @param dto the data transfer object with the member's data
   * @returns a default message response object
   * @throws {BadRequestException} if the member is not found
   */
  public async updateMySetting(member: IMember, dto: UpdateMySettingDto) {
    const { password, ...rest } = dto;
    const memberUpdate = await this.findOneById(member.id);
    if (!memberUpdate) {
      throw new BadRequestException('Account not found');
    }
    if (password) {
      const salt = await bcrypt.genSalt();
      const passwordHash = await this.hashPassword(password, salt);
      await this.memberRepository.update(
        { id: member.id },
        {
          password: passwordHash,
          salt,
        },
      );
    }
    await this.memberRepository.update(
      { id: member.id },
      {
        ...rest,
      },
    );
    await this.redisService.del(`member:${member.id}`);
    return {
      message: 'Success',
    };
  }

  /**
   * Check if member has higher privilege than other member
   *
   * @param member the member object
   * @param memberOther the other member object
   * @returns a boolean value
   */
  public async hasHigherPrivilegeThan(
    member: IMember,
    memberOther: IMember,
  ): Promise<boolean> {
    // If same member, no permission
    if (member.id === memberOther.id) {
      return false;
    }

    // Root admin can ban anyone except themselves
    if (member.email === process.env.EMAIL_ADMIN_ROOT) {
      return true;
    }

    // Admin can ban employees and owners (but not other admins)
    if (member.roleMember === RoleMember.ADMIN) {
      return memberOther.roleMember !== RoleMember.ADMIN;
    }

    // Employees can't ban anyone
    return false;
  }
}
