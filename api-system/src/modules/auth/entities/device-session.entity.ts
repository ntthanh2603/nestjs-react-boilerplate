import { BaseEntity } from 'src/common/entities/base.entity';
import { Members } from 'src/modules/members/entities/member.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('device-session')
export default class DeviceSessions extends BaseEntity {
  @Column('text', { unique: true })
  deviceId: string;

  @Column('text', { nullable: true })
  name: string;

  @Column('text')
  ua: string;

  @Column('text')
  secretKey: string;

  @Column('text')
  refreshToken: string;

  @Column('timestamp')
  expiredAt: Date;

  @Column('text')
  ipAddress: string;

  @Column('text', { nullable: true })
  memberId: string;

  @ManyToOne(() => Members, (member) => member.deviceSessions)
  @JoinColumn({ name: 'memberId' })
  member: Members;
}
