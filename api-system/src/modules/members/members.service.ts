import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Members } from './entities/member.entity';
import {
  SignUpMemberDto,
  SignInMemberStep1Dto,
  SignInMemberStep2Dto,
  BanMemberDto,
  UpdateMySettingDto,
  UpdateProfileByHigherPrivilegeThanDto,
} from './dto/member.dto';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LinkType, RoleMember } from 'src/common/enums/enum';
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
   * @throws {ConflictException} if the email address is already used
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
      });
      const image = await this.imagesService.findByLinkTypeAndLinkId(
        LinkType.MEMBER,
        id,
      );
      member = { ...memberDb, image };
      const redisMember = { ...member };
      await this.redisService.hMSet(`member:${id}`, redisMember);

      await this.redisService.expire(`member:${id}`, 3600); // 1 hour

      const { password: _, salt: __, ...memberResponse } = member;

      if (memberResponse.idBanned) {
        throw new UnauthorizedException('Tài khoản đã bị khóa');
      }
      return {
        ...memberResponse,
      };
    } else {
      const { password: _, salt: __, ...memberResponse } = member;

      if (memberResponse.idBanned) {
        throw new UnauthorizedException('Tài khoản đã bị khóa');
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
      storeId,
      workBranchId,
    } = queryDto;

    // Build the base query
    const query = this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.store', 'store')
      .leftJoinAndSelect('member.workBranch', 'workBranch');

    if (storeId) {
      query.andWhere('store.id = :storeId', { storeId });
    }
    if (workBranchId) {
      query.andWhere('workBranch.id = :workBranchId', { workBranchId });
    }
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

    // Get all member images in a single query
    const memberIds = members.map((member) => member.id);
    const memberImages =
      memberIds.length > 0 ? await this.getMemberImages(memberIds) : {};

    // Map members to include their images
    const membersWithImages = members.map((member) => ({
      ...member,
      image: memberImages[member.id] || null,
    }));

    return getManyResponse(
      {
        page,
        limit,
        sortBy: sortBy || 'createdAt',
        sortOrder,
      },
      membersWithImages,
      total,
    );
  }

  /**
   * Get member images
   *
   * @param memberIds the IDs of the members
   * @returns a promise resolving to an object mapping member IDs to their images
   */
  private async getMemberImages(
    memberIds: string[],
  ): Promise<Record<string, Images>> {
    if (memberIds.length === 0) return {};

    const images = await this.imagesService.findManyByLinkTypeAndLinkIds(
      LinkType.MEMBER,
      memberIds,
    );

    return images.reduce<Record<string, Images>>((acc, image) => {
      if (image.linkId) {
        acc[image.linkId] = image;
      }
      return acc;
    }, {});
  }

  /**
   * Sign up an admin
   *
   * @param dto the data transfer object with the admin's data
   * @returns a default message response object
   * @throws {ConflictException} if the email address is already used
   */
  public async signUpAdmin(
    admin: IMember,
    dto: SignUpMemberDto,
  ): Promise<Members> {
    if (admin.email !== process.env.EMAIL_ADMIN_ROOT) {
      throw new UnauthorizedException('Bạn không có quyền tạo tài khoản admin');
    }
    const member = await this.memberRepository.count({
      where: { email: dto.email },
    });
    if (member > 0) {
      throw new ConflictException('Email đã được sử dụng');
    }
    const salt = await bcrypt.genSalt();
    const id = uuidv4();

    try {
      return await this.memberRepository.save({
        ...dto,
        id,
        password: await this.hashPassword(dto.password, salt),
        salt,
        roleMember: RoleMember.ADMIN,
      });
    } catch (e) {
      if (e instanceof ConflictException) {
        throw new ConflictException(e.message);
      }
      throw new InternalServerErrorException();
    }
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
      relations: ['store', 'workBranch'],
    });

    if (!member) {
      throw new UnauthorizedException('Tài khoản không tồn tại');
    }
    const image = await this.imagesService.findByLinkTypeAndLinkId(
      LinkType.MEMBER,
      member.id,
    );
    member = { ...member, image: image || undefined };

    // If member not found or password is incorrect
    if (
      !member ||
      member.password !== (await this.hashPassword(password, member.salt!))
    ) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // If 2FA is required but not enabled for the member
    if (require2FA && !member.is2FA) {
      throw new UnauthorizedException('2FA không được bật');
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
    let sessionData = { ...metaData };

    // Add role-specific data
    if (member.roleMember === RoleMember.OWNER && member.storeId) {
      sessionData = { ...sessionData, storeId: member.storeId };
    } else if (
      member.roleMember === RoleMember.EMPLOYEE &&
      member.workBranchId
    ) {
      sessionData = { ...sessionData, workBranchId: member.workBranchId };
    }

    const newDeviceSession = await this.authService.handleDeviceSession(
      member.id,
      member.roleMember,
      sessionData,
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
        subject: 'Xác thực tài khoản',
        template: 'send-otp-sign-up',
        context: {
          otp,
          fullName: member.fullName,
        },
      });

      return { message: 'Mã OTP đã được gửi đến email của bạn' };
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
      throw new UnauthorizedException('Mã OTP không chính xác');
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
   * Sign up an owner
   *
   * @param dto the data transfer object with the owner's data
   * @returns a default message response object
   * @throws {ConflictException} if the email address is already used
   */
  public async signUpOwner(dto: SignUpMemberDto) {
    const member = await this.memberRepository.count({
      where: { email: dto.email },
    });
    if (member > 0) {
      throw new ConflictException('Email đã được sử dụng');
    }
    const salt = await bcrypt.genSalt();
    const id = uuidv4();

    const password = await this.hashPassword(dto.password!, salt);

    try {
      return await this.memberRepository.save({
        ...dto,
        id,
        password,
        salt,
        roleMember: RoleMember.OWNER,
      });
    } catch (e) {
      if (e instanceof ConflictException) {
        throw new ConflictException(e.message);
      }
      throw new InternalServerErrorException();
    }
  }

  /**
   * Update isBanned
   *
   * @param member the member object
   * @param dto the data transfer object with the isBanned value
   * @returns a default message response object
   * @throws {BadRequestException} if the member is not found or the member is an admin
   */
  public async updateIsBanned(
    member: IMember,
    dto: BanMemberDto,
  ): Promise<void> {
    const { memberId, isBanned } = dto;

    // Check if the current member has higher privilege than the target member
    const hasPermission = await this.hasHigherPrivilegeThan(
      member.id,
      memberId,
    );

    if (!hasPermission) {
      throw new BadRequestException(
        'Bạn không có quyền thay đổi tài khoản này',
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
      throw new BadRequestException('Tài khoản không tồn tại');
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
   * @param memberId the member id
   * @param memberOtherId the other member id
   * @returns a boolean value
   */
  public async hasHigherPrivilegeThan(
    memberId: string,
    memberOtherId: string,
  ): Promise<boolean> {
    // If same member, no permission
    if (memberId === memberOtherId) {
      return false;
    }
    // Get member info
    const member = await this.memberRepository.findOne({
      where: { id: memberId },
      select: ['id', 'email', 'roleMember', 'storeId'],
    });

    if (!member) {
      return false;
    }

    // Root admin can ban anyone except themselves
    if (member.email === process.env.EMAIL_ADMIN_ROOT) {
      return true;
    }

    // Get other member's info
    const memberOther = await this.memberRepository.findOne({
      where: { id: memberOtherId },
      select: ['id', 'roleMember'],
    });

    if (!memberOther) {
      return false;
    }

    // Admin can ban employees and owners (but not other admins)
    if (member.roleMember === RoleMember.ADMIN) {
      return memberOther.roleMember !== RoleMember.ADMIN;
    }

    // Owner can only ban employees in their store
    if (member.roleMember === RoleMember.OWNER && member.storeId) {
      if (memberOther.roleMember !== RoleMember.EMPLOYEE) {
        return false;
      }

      const count = await this.memberRepository
        .createQueryBuilder('members')
        .leftJoin('members.work_branch_employees', 'work_branch_employee')
        .leftJoin('work_branch_employee.workBranch', 'work_branch')
        .where('work_branch.storeId = :storeId', { storeId: member.storeId })
        .andWhere('members.id = :memberId', { memberId: memberOtherId })
        .getCount();

      return count > 0;
    }

    // Employees can't ban anyone
    return false;
  }

  public async updateProfileByHigherPrivilegeThan(
    member: IMember,
    dto: UpdateProfileByHigherPrivilegeThanDto,
    id: string,
  ) {
    const isHigherPrivilegeThan = this.hasHigherPrivilegeThan(member.id, id);
    if (!isHigherPrivilegeThan) {
      throw new BadRequestException(
        'Bạn không có quyền thay đổi tài khoản này',
      );
    }
    await this.memberRepository.update({ id }, dto);
    await this.redisService.del(`member:${id}`);
    return {
      message: 'Success',
    };
  }
}
