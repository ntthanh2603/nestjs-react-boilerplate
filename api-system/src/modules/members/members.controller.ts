import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
  SignInMemberConfirmOtpDto,
  UpdateMySettingDto,
  UpdateRoleDto,
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
import { Admin } from 'src/common/decorators/app.decorator';
import { IdQueryParamDto } from 'src/common/dtos/id-query-param.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Members')
@Controller('members')
export class MembersController {
  constructor(
    private readonly membersService: MembersService,
    private readonly authService: AuthService,
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
    summary: 'Filter search member. Role: Member',
    description: 'Filter search member. Return a list of member objects',
    response: {
      serialization: GetManyBaseResponseDto<Members>,
    },
  })
  @Get('/search')
  @UseGuards(JwtAuthGuard)
  filterSearchMembers(@Query() query: FilterSearchMemberDto) {
    return this.membersService.filterSearchMembers(query);
  }

  @Doc({
    summary: 'Sign in member send otp or redrect to dashboard. Public',
    description:
      'Login to application with email and password. Return a token to access protected routes',
    response: {
      serialization: LoginResponseDto,
    },
  })
  @Throttle({ default: { limit: 1, ttl: 5000 } })
  @Post('/sign-in/send-otp')
  async signInSendOtp(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
    @Headers() headers: Headers,
    @Body() dto: SignInMemberStep1Dto,
  ) {
    const ipAddress = req.connection.remoteAddress;
    const ua = headers['user-agent'];
    const deviceId = req.fingerprint.hash;
    const metaData: LoginMetadata = { ipAddress, ua, deviceId };
    const result: any = await this.membersService.signInSendOtp(
      res,
      dto,
      metaData,
    );

    return result;
  }

  @Doc({
    summary: 'Sign in member confirm otp. Public',
    description:
      'Login to application with email and password. Return a token to access protected routes',
    response: {
      serialization: LoginResponseDto,
    },
  })
  @Throttle({ default: { limit: 1, ttl: 5000 } })
  @Post('/sign-in/confirm-otp')
  async signInStep2(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
    @Headers() headers: Headers,
    @Body() dto: SignInMemberConfirmOtpDto,
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
    summary: 'Update role admin. Role: ADMIN',
    description:
      'Update role admin to member. Return a default message response object',
    response: {
      serialization: DefaultMessageResponseDto,
    },
  })
  @Patch('/role')
  @UseGuards(JwtAuthGuard)
  @Role(RoleMember.ADMIN)
  async updateRole(@Admin() admin: IMember, @Body() dto: UpdateRoleDto) {
    await this.membersService.updateRole(admin, dto);

    return {
      message: 'Success',
    };
  }

  @Doc({
    summary: 'Update is banned member. Role: ADMIN',
    description:
      'Update is banned member. Return a message to confirm the operation',
    response: {
      serialization: DefaultMessageResponseDto,
    },
  })
  @Patch('/ban')
  @UseGuards(JwtAuthGuard)
  @Role(RoleMember.ADMIN)
  async updateIsBanned(
    @Admin() admin: IMember,
    @Body() dto: BanMemberDto,
  ): Promise<DefaultMessageResponseDto> {
    await this.membersService.updateIsBanned(admin, dto);

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
  @Patch('/settings')
  @UseGuards(JwtAuthGuard)
  async updateMySetting(
    @Member() member: IMember,
    @Body() dto: UpdateMySettingDto,
  ): Promise<DefaultMessageResponseDto> {
    await this.membersService.updateMySetting(member, dto);

    return {
      message: 'Success',
    };
  }

  @Doc({
    summary: 'Delete member. Role: Member',
    description: 'Delete member. Return a message to confirm the operation',
    response: {
      serialization: DefaultMessageResponseDto,
    },
  })
  @Delete()
  @UseGuards(JwtAuthGuard)
  deleteMember(@Member() member: IMember) {
    return this.membersService.deleteMember(member);
  }
}
