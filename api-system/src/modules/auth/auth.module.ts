import { Global, Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import DeviceSessionEntity from './entities/device-session.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { MembersModule } from '../members/members.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceSessionEntity]),
    forwardRef(() => MembersModule),
    JwtModule.register({}),
    PassportModule,
  ],
  controllers: [],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
