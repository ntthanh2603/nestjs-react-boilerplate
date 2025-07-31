import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { ApiTags } from '@nestjs/swagger';
import {
  BanMemberDto,
  GetMemberResponseDto,
  SignInMemberStep1Dto,
  SignInMemberStep2Dto,
  SignUpMemberDto,
  UpdateMySettingDto,
  UpdateProfileByHigherPrivilegeThanDto,
} from './dto/member.dto';
import { Doc } from 'src/common/doc/doc.decorator';
import { DefaultMessageResponseDto } from 'src/common/dtos/default-message-response.dto';
import { GetManyBaseResponseDto } from 'src/common/dtos/get-many-base.dto';
import { Response } from 'express';
import {
  LoginMetadata,
  LoginResponseDto,
} from 'src/common/interfaces/login.interface';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { IMember } from 'src/common/interfaces/app.interface';
import { AuthService } from '../auth/auth.service';
import { Member, Role } from 'src/common/decorators/app.decorator';
import { RoleMember } from 'src/common/enums/enum';
import { Members } from './entities/member.entity';
import { FilterSearchMemberDto } from './dto/member.dto';
import { EXPIRED_REFRESH_TOKEN } from 'src/common/constants/app.constants';
import { LogNestService } from 'src/log-nest/log-nest.service';
import { Admin } from 'src/common/decorators/app.decorator';
import { IdQueryParamDto } from 'src/common/dtos/id-query-param.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Members')
@Controller('members')
export class MembersController {
  constructor(
    private readonly membersService: MembersService,
    private readonly authService: AuthService,
    private readonly logNestService: LogNestService,
  ) {}

  @Doc({
    summary: 'Get profile member. Role: MEMBER',
    description: 'Get profile member. Return a member object',
    response: {
      serialization: GetMemberResponseDto,
    },
  })
  @Get('/profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Member() member: IMember) {
    return member;
  }

  @Doc({
    summary: 'Get member by id. Role: MEMBER',
    description: 'Get member by id. Return a member object',
    response: {
      serialization: GetMemberResponseDto,
    },
  })
  @Get('/profile/:id')
  @UseGuards(JwtAuthGuard)
  getMemberById(@Param() { id }: IdQueryParamDto) {
    return this.membersService.findOneById(id);
  }

  @Doc({
    summary: 'Filter search member. Role: ADMIN',
    description: 'Filter search member. Return a list of member objects',
    response: {
      serialization: GetManyBaseResponseDto<Members>,
    },
  })
  @Get('/filter-search-members')
  @Role(RoleMember.ADMIN)
  @UseGuards(JwtAuthGuard)
  filterSearchMembers(@Query() query: FilterSearchMemberDto) {
    return this.membersService.filterSearchMembers(query);
  }

  @Doc({
    summary: 'Sign up admin. Role: ADMIN',
    description:
      'Sign up an admin with email and password. Return a default message response object',
    response: {
      serialization: DefaultMessageResponseDto,
    },
  })
  @Post('/sign-up-admin')
  @UseGuards(JwtAuthGuard)
  @Role(RoleMember.ADMIN)
  async signUpAdmin(@Admin() admin: IMember, @Body() dto: SignUpMemberDto) {
    try {
      const result = await this.membersService.signUpAdmin(admin, dto);
      await this.logNestService.createLog({
        memberId: admin.id,
        action: 'Tạo tài khoản admin',
        context: 'MEMBERS',
        status: 'SUCCESS',
        details: {
          memberId: result.id,
          email: result.email,
          fullName: result.fullName,
        },
      });
      return {
        message: 'Success',
      };
    } catch (e) {
      throw e;
    }
  }

  @Doc({
    summary: 'Sign up owner. Role: ADMIN',
    description:
      'Sign up an owner with email and password. Return a default message response object',
    response: {
      serialization: DefaultMessageResponseDto,
    },
  })
  @Post('/sign-up-owner')
  @UseGuards(JwtAuthGuard)
  @Role(RoleMember.ADMIN)
  async signUpOwner(@Admin() admin: IMember, @Body() dto: SignUpMemberDto) {
    try {
      const result = await this.membersService.signUpOwner(dto);
      await this.logNestService.createLog({
        memberId: admin.id,
        action: 'Tạo tài khoản chủ cửa hàng',
        context: 'MEMBERS',
        status: 'SUCCESS',
        details: {
          memberId: result.id,
          email: result.email,
          fullName: result.fullName,
        },
      });
      return {
        message: 'Success',
      };
    } catch (e) {
      throw e;
    }
  }

  @Doc({
    summary: 'Sign in member step 1. Public',
    description:
      'Login to application with email and password. Return a token to access protected routes',
    response: {
      serialization: LoginResponseDto,
    },
  })
  @Throttle({ default: { limit: 1, ttl: 5000 } })
  @Post('/sign-in-step-1')
  async signInStep1(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
    @Headers() headers: Headers,
    @Body() dto: SignInMemberStep1Dto,
  ) {
    const ipAddress = req.connection.remoteAddress;
    const ua = headers['user-agent'];
    const deviceId = req.fingerprint.hash;
    const metaData: LoginMetadata = { ipAddress, ua, deviceId };
    const result: any = await this.membersService.signInStep1(
      res,
      dto,
      metaData,
    );

    return result;
  }

  @Doc({
    summary: 'Sign in member step 2. Public',
    description:
      'Login to application with email and password. Return a token to access protected routes',
    response: {
      serialization: LoginResponseDto,
    },
  })
  @Throttle({ default: { limit: 1, ttl: 5000 } })
  @Post('/sign-in-step-2')
  async signInStep2(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
    @Headers() headers: Headers,
    @Body() dto: SignInMemberStep2Dto,
  ) {
    const ipAddress = req.connection.remoteAddress;
    const ua = headers['user-agent'];
    const deviceId = req.fingerprint.hash;
    const metaData: LoginMetadata = { ipAddress, ua, deviceId };
    const result: any = await this.membersService.signInStep2(
      res,
      dto,
      metaData,
    );
    return result;
  }

  @Doc({
    summary: 'Sign out member. Role: MEMBER',
    description:
      'Logout from application. Return a message to confirm the operation',
    response: {
      serialization: DefaultMessageResponseDto,
    },
  })
  @Post('/sign-out')
  @UseGuards(JwtAuthGuard)
  async signOut(
    @Member() member: IMember,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
    });
    return this.authService.signOut(member);
  }

  @Doc({
    summary: 'Refresh token member. Public',
    description:
      'Refresh token to get a new access token. Return a token to access protected routes',
    response: {
      serialization: LoginResponseDto,
    },
  })
  @Throttle({ default: { limit: 1, ttl: 5000 } })
  @Post('/refresh-token')
  async refreshToken(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const _refreshToken = req.cookies.refreshToken;
    const deviceId = req.fingerprint.hash;
    const result = await this.authService.refreshToken(deviceId, _refreshToken);

    // Clear existing refresh token
    res.clearCookie('refreshToken', {
      httpOnly: true,
    });
    // Set new refresh token
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      maxAge: EXPIRED_REFRESH_TOKEN * 24 * 60 * 60 * 1000, // milliseconds
    });
    return {
      token: result.token,
      expiredAt: result.expiredAt,
      member: result.member,
    };
  }

  @Doc({
    summary: 'Update is banned member. Role: ADMIN, OWNER',
    description:
      'Update is banned member. Return a message to confirm the operation',
    response: {
      serialization: DefaultMessageResponseDto,
    },
  })
  @Patch('/update-is-banned-member')
  @UseGuards(JwtAuthGuard)
  @Role(RoleMember.ADMIN, RoleMember.OWNER)
  async updateIsBanned(
    @Member() member: IMember,
    @Body() dto: BanMemberDto,
  ): Promise<DefaultMessageResponseDto> {
    await this.membersService.updateIsBanned(member, dto);
    await this.logNestService.createLog({
      memberId: member.id,
      action: 'Cập nhật trạng thái khóa tài khoản',
      context: 'MEMBERS',
      status: 'SUCCESS',
      details: {
        memberId: dto.memberId,
        isBanned: dto.isBanned,
      },
    });
    return {
      message: 'Success',
    };
  }

  @Doc({
    summary: 'Update my setting. Role: MEMBER',
    description: 'Update my setting. Return a message to confirm the operation',
    response: {
      serialization: DefaultMessageResponseDto,
    },
  })
  @Patch('/update-my-setting')
  @UseGuards(JwtAuthGuard)
  async updateMySetting(
    @Member() member: IMember,
    @Body() dto: UpdateMySettingDto,
  ): Promise<DefaultMessageResponseDto> {
    await this.membersService.updateMySetting(member, dto);
    await this.logNestService.createLog({
      memberId: member.id,
      action: 'Cập nhật thông tin cá nhân',
      context: 'MEMBERS',
      status: 'SUCCESS',
      details: {
        memberId: member.id,
        fullName: member.fullName,
        email: member.email,
        phoneNumber: member.phoneNumber,
      },
    });
    return {
      message: 'Success',
    };
  }

  @Doc({
    summary: 'Update profile by higher privilege than. Role: ADMIN, OWNER',
    description:
      'Update profile by higher privilege than. Return a message to confirm the operation',
    response: {
      serialization: DefaultMessageResponseDto,
    },
  })
  @Patch('/update-profile-by-higher-privilege-than/:id')
  @UseGuards(JwtAuthGuard)
  @Role(RoleMember.ADMIN, RoleMember.OWNER)
  async updateProfileByHigherPrivilegeThan(
    @Member() member: IMember,
    @Param() { id }: IdQueryParamDto,
    @Body() dto: UpdateProfileByHigherPrivilegeThanDto,
  ): Promise<DefaultMessageResponseDto> {
    await this.membersService.updateProfileByHigherPrivilegeThan(
      member,
      dto,
      id,
    );
    await this.logNestService.createLog({
      memberId: member.id,
      action: 'Cập nhật thông tin cá nhân',
      context: 'MEMBERS',
      status: 'SUCCESS',
      details: {
        memberId: member.id,
        fullName: member.fullName,
        email: member.email,
        phoneNumber: member.phoneNumber,
      },
    });
    return {
      message: 'Success',
    };
  }
}
