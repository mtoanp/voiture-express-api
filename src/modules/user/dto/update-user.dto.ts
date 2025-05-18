import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import xss from 'xss';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Transform(({ value }) =>
    typeof value === 'string' ? xss(value.trim()) : value,
  )
  name?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? xss(value.trim()) : value,
  )
  tel?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? xss(value.trim()) : value,
  )
  document?: string;
}
