import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { BaseEntity } from 'src/common/entities/base.entity';
import { LinkType } from 'src/common/enums/enum';

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

  @IsString()
  @ApiProperty()
  @Column({ nullable: true })
  linkId?: string;

  @IsString()
  @ApiProperty()
  @Column({ nullable: true })
  linkType?: LinkType;
}
