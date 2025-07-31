import { GetManyBaseQueryParams } from 'src/common/dtos/get-many-base.dto';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FilterSearchLogDto extends GetManyBaseQueryParams {
  @IsString()
  @ApiProperty()
  @IsUUID('4')
  @IsNotEmpty()
  memberId: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  search?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  @IsEnum(['SUCCESS', 'FAILURE'])
  status?: 'SUCCESS' | 'FAILURE';

  @IsString()
  @ApiProperty()
  @IsOptional()
  date?: string;
}
