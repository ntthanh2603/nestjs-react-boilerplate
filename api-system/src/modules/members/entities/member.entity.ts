import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';
import DeviceSessionEntity from 'src/modules/auth/entities/device-session.entity';
import { Logging } from 'src/logging/entities/logging.entity';
import { OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Gender, RoleMember } from 'src/common/enums/enum';
import { Images } from 'src/images/entities/images.entity';

@Entity('members')
export class Members extends BaseEntity {
  @Column('text', { unique: true })
  email?: string;

  @Column('text')
  password: string;

  @Column('text')
  fullName?: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('text', { nullable: true })
  phoneNumber?: string;

  @Column('text', { nullable: true })
  cid?: string;

  @Column('text', { nullable: true })
  gender?: Gender;

  @Column('date', { nullable: true })
  birthday?: Date;

  @Column('boolean', { default: false })
  is2FA?: boolean;

  @Column('text', { nullable: true })
  salt: string;

  @Column('enum', { enum: RoleMember, default: RoleMember.USER })
  roleMember: RoleMember;

  @Column('boolean', { default: false })
  isBanned: boolean;

  @Column('boolean', { default: true })
  isNotification?: boolean;

  @Column('date', { nullable: true })
  dateOfIssue?: Date;

  @Column('text', { nullable: true })
  placeOfIssue?: string;

  @Column('text', { nullable: true })
  facebook?: string;

  @Column('json', { nullable: true })
  address?: {
    provinceOrMunicipality: string;
    districtOrTown: string;
  };

  @OneToMany(() => DeviceSessionEntity, (deviceSession) => deviceSession.member)
  deviceSessions: DeviceSessionEntity[];

  @Column('text', { name: 'store_id', nullable: true })
  storeId?: string;

  @Column('text', { name: 'work_branch_id', nullable: true })
  workBranchId?: string;

  @OneToMany(() => Logging, (logging) => logging.member)
  logging: Logging[];

  @OneToOne(() => Images, (images) => images.member)
  @JoinColumn({ name: 'image_id', referencedColumnName: 'id' })
  image: Images;
}
