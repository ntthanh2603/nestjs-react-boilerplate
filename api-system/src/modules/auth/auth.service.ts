import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import DeviceSessionEntity from './entities/device-session.entity';
import { Repository } from 'typeorm';
import {
  LoginMetadata,
  LoginResponse,
} from 'src/common/interfaces/login.interface';
import * as randomatic from 'randomatic';
import * as crypto from 'crypto';
import { RedisService } from 'src/redis/redis.service';
import { IMember } from 'src/common/interfaces/app.interface';
import { DefaultMessageResponseDto } from 'src/common/dtos/default-message-response.dto';
import {
  EXPIRED_ACCESS_TOKEN,
  EXPIRED_REFRESH_TOKEN,
} from 'src/common/constants/app.constants';
import { JwtService } from '@nestjs/jwt';
import addDay from 'src/common/helpers/addDay';
import { RoleMember } from 'src/common/enums/enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(DeviceSessionEntity)
    private readonly repo: Repository<DeviceSessionEntity>,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Generate a secret key for the member
   *
   * @param payload the payload of the JWT token
   * @param length the length of the secret key
   * @returns the secret key
   */
  private generateSecretKey(payload: IMember, length = 16) {
    const { id, deviceId } = payload;
    const secretKey = randomatic('A0', length);
    this.redisService.set(`sk:${id}:${deviceId}`, secretKey, 1 * 60 * 60);
    return secretKey;
  }

  /**
   * Get the secret key from the cache or database
   *
   * @param payload the payload of the JWT token
   * @returns the secret key if found
   */
  public async getSecretKey(payload: IMember): Promise<string | undefined> {
    const { id, deviceId, roleMember } = payload;

    const secretkeyCache = await this.redisService.get(`sk:${id}:${deviceId}`);
    if (secretkeyCache) return secretkeyCache;

    const deviceSession = await this.repo
      .createQueryBuilder('ds')
      .where('ds.deviceId = :deviceId', { deviceId })
      .andWhere('ds.userId = :userId', { userId: id })
      .andWhere('ds.roleMember = :roleMember', { roleMember })
      .andWhere('ds.isBanned = :isBanned', { isBanned: false })
      .andWhere('ds.expiredAt > :expiredAt', { expiredAt: new Date() })
      .getOne();

    const secretKey = deviceSession?.secretKey;
    if (secretKey) {
      await this.redisService.set(
        `sk:${id}:${deviceId}`,
        String(secretKey),
        1 * 60 * 60,
      );
    }
    return secretKey;
  }

  /**
   * Handle the device session
   *
   * @param userId the user id
   * @param roleMember the role member
   * @param metaData the metadata of the user
   * @returns the login response
   */
  public async handleDeviceSession(
    userId: string,
    roleMember: RoleMember,
    metaData: LoginMetadata,
  ): Promise<LoginResponse> {
    const { deviceId, ipAddress, ua } = metaData;

    const currentDevice = await this.repo.findOne({
      where: { deviceId },
    });

    const expiredAt = addDay(EXPIRED_REFRESH_TOKEN);

    const payload: IMember = {
      id: userId,
      roleMember,
      deviceId,
      storeId: metaData.storeId,
      workBranchId: metaData.workBranchId,
    };

    const secretKey = this.generateSecretKey(payload);

    const token = this.jwtService.sign(payload, {
      secret: secretKey,
      expiresIn: EXPIRED_ACCESS_TOKEN,
    });
    const refreshToken = randomatic('Aa0', 64);

    const deviceName = metaData.deviceId;
    const newDeviceSession = new DeviceSessionEntity();
    newDeviceSession.id = currentDevice?.id || crypto.randomUUID();
    newDeviceSession.memberId = userId;
    newDeviceSession.secretKey = secretKey;
    newDeviceSession.refreshToken = refreshToken;
    newDeviceSession.expiredAt = expiredAt;
    newDeviceSession.deviceId = deviceId;
    newDeviceSession.ipAddress = ipAddress;
    newDeviceSession.ua = ua;
    newDeviceSession.name = deviceName;

    await this.repo.save(newDeviceSession);

    return {
      token,
      refreshToken,
      expiredAt,
    };
  }

  /**
   * Sign out the member
   *
   * @param member the member
   * @returns a default message response object
   */
  public async signOut(member: IMember): Promise<DefaultMessageResponseDto> {
    const { id, deviceId } = member;

    await this.repo.delete({ memberId: id, deviceId });

    await this.redisService.del(`sk:${id}:${deviceId}`);

    return {
      message: 'Success',
    };
  }

  /**
   * Refresh token
   *
   * @param deviceId the device id
   * @param _refreshToken the refresh token
   * @returns a new access token and refresh token
   */
  public async refreshToken(
    deviceId: string,
    _refreshToken: string,
  ): Promise<LoginResponse> {
    const session: any = await this.repo
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.member', 'member')
      .leftJoinAndSelect('member.store', 'store')
      .leftJoinAndSelect('member.workBranch', 'workBranch')
      .where('session.refreshToken = :_refreshToken', { _refreshToken })
      .andWhere('session.deviceId = :deviceId', { deviceId })
      .andWhere('member.isBanned = :isBanned', { isBanned: false })
      .getOne();

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if refresh token has expired
    if (session.refreshTokenExpiresAt < new Date()) {
      await this.repo.remove(session);
      throw new UnauthorizedException('Refresh token has expired');
    }

    const payload: IMember = {
      id: session.member.id,
      deviceId,
      roleMember: session.member.roleMember,
      storeId: session.member.store?.id,
      workBranchId: session.member.workBranch?.id,
    };

    const secretKey = this.generateSecretKey(payload);
    const token = this.jwtService.sign(payload, {
      secret: secretKey,
      expiresIn: EXPIRED_ACCESS_TOKEN,
    });
    const refreshToken = randomatic('Aa0', 64);
    const expiredAt = addDay(EXPIRED_REFRESH_TOKEN);

    await this.repo.update(session.id, {
      secretKey,
      refreshToken,
      expiredAt,
    });

    const { password: _, salt: __, ...memberResponse } = session.member;
    return {
      token,
      refreshToken,
      expiredAt,
      member: memberResponse,
    };
  }
}
