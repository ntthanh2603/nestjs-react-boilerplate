import {
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
  IsObject,
  IsUUID,
  IsOptional,
  IsEnum,
  IsBoolean,
  Length,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { GetManyBaseQueryParams } from 'src/common/dtos/get-many-base.dto';
import { Gender, RoleMember } from 'src/common/enums/enum';

export class AddressDto {
  @ApiProperty({ example: 'Hà Nội' })
  @IsString()
  provinceOrMunicipality: string;

  @ApiProperty({ example: 'Ba Đình' })
  @IsString()
  districtOrTown: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  detail: string;
}

export class SignInMemberStep1Dto {
  @ApiProperty({ example: 'tuanthanh2kk4@gmail.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  password: string;

  @ApiProperty({ enum: RoleMember, example: RoleMember.ADMIN })
  @IsEnum(RoleMember)
  roleMember: RoleMember;
}

export class SignInMemberConfirmOtpDto extends SignInMemberStep1Dto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  otp: string;
}

export class SignUpMemberDto {
  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  otp?: string;
}

export class GetMemberResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  fullName?: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  phoneNumber?: string;

  @ApiProperty()
  cid?: string;

  @ApiProperty({ enum: Gender })
  gender?: Gender;

  @ApiProperty()
  birthday?: Date;

  @ApiProperty()
  is2FA?: boolean;

  @ApiProperty({ enum: RoleMember })
  roleMember: RoleMember;

  @ApiProperty()
  isBanned: boolean;

  @ApiProperty()
  isNotification?: boolean;

  @ApiProperty()
  dateOfIssue?: Date;

  @ApiProperty()
  placeOfIssue?: string;

  @ApiProperty()
  facebook?: string;

  @ApiProperty({ type: AddressDto })
  address?: AddressDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class FilterSearchMemberDto extends PartialType(GetManyBaseQueryParams) {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Length(0, 100)
  search?: string;

  @ApiProperty({ required: false })
  @IsEnum(RoleMember)
  @IsOptional()
  roleMember?: RoleMember;

  @ApiProperty({ required: false, example: true })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  isBanned?: boolean;
}

export class BanMemberDto {
  @ApiProperty()
  @IsUUID('4', { message: 'memberId must be UUID' })
  memberId: string;

  @ApiProperty()
  @IsBoolean()
  isBanned: boolean;
}

export class UpdateMySettingDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  @IsObject()
  address?: AddressDto;

  @ApiProperty()
  @IsOptional()
  @IsString()
  gender?: Gender;

  @ApiProperty()
  @IsOptional()
  @IsString()
  facebook?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  birthday?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  is2FA?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isNotification?: boolean;
}

export class UpdateProfileByHigherPrivilegeThanDto {
  @ApiProperty()
  @IsString()
  cid: string;

  @ApiProperty()
  dateOfIssue: Date;

  @ApiProperty()
  @IsString()
  placeOfIssue: string;

  @ApiProperty()
  @IsString()
  birthday: string;

  @ApiProperty()
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty()
  @IsObject()
  address: AddressDto;
}

export class UpdateRoleDto {
  @ApiProperty()
  @IsUUID('4', { message: 'MemberId must be UUID' })
  id: string;

  @ApiProperty()
  @IsEnum(RoleMember)
  roleMember: RoleMember;
}
