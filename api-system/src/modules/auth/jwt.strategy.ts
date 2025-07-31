import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { RoleMember } from 'src/common/enums/enum';
import { IMember } from 'src/common/interfaces/app.interface';
import { MembersService } from '../members/members.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly memberService: MembersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKeyProvider: async (request, rawJwtPayload, done) => {
        try {
          const payload: IMember = this.jwtService.decode(rawJwtPayload);

          if (!payload.deviceId) {
            return done(
              new UnauthorizedException('Authentication failed!'),
              null,
            );
          }

          const secretKey = await this.authService.getSecretKey(payload);
          if (!secretKey) {
            return done(
              new UnauthorizedException('Authentication failed!'),
              null,
            );
          }
          return done(null, secretKey);
        } catch (error) {
          return done(
            new UnauthorizedException('Authentication failed!'),
            null,
          );
        }
      },
    });
  }

  /**
   * Validate the JWT token
   *
   * @param request the request object
   * @param payload the payload of the JWT token
   * @returns the payload if the token is valid
   */
  async validate(request: any, payload: IMember): Promise<IMember> {
    const { deviceId } = payload;

    // Check if the token was issued for the current device
    const fingerprint = request.fingerprint?.hash;
    if (fingerprint !== deviceId) {
      throw new UnauthorizedException('Authentication failed!');
    }

    let member: IMember = await this.memberService.findOneById(payload.id);

    member.deviceId = deviceId;

    request.member = member;

    if (member.roleMember === RoleMember.ADMIN) {
      request.admin = member;
    } else if (member.roleMember === RoleMember.USER) {
      request.user = member;
    }
    return member;
  }
}
