import { Members } from 'src/modules/members/entities/member.entity';

export interface LoginMetadata {
  ipAddress: string;
  ua: string;
  deviceId: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiredAt: Date;
  member?: Members;
}

export class LoginResponseDto {
  token: string;
  expiredAt: Date;
}
