import { Module } from '@nestjs/common';
import { MembersModule } from './members/members.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [MembersModule, AuthModule],
})
export class CombineModule {}
