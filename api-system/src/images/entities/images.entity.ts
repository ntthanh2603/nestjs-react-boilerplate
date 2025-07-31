import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Members } from 'src/modules/members/entities/member.entity';

@Entity('images')
export class Images extends BaseEntity {
  @IsString()
  @ApiProperty()
  @Column()
  filename: string;

  @IsString()
  @ApiProperty()
  @Column()
  url: string;

  @IsString()
  @ApiProperty()
  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true, name: 'user_id' })
  userId: string;

  @OneToOne(() => Members, (member) => member.image)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  member: Members;
}
