import { Transform } from 'class-transformer';
import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
} from 'class-validator';
import xss from 'xss';
import { NormalizeEmail } from '../normalize-email.decorator';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Transform(({ value }) => xss(value.trim()))
  name: string;

  @IsEmail()
  @NormalizeEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).*$/, {
    message:
      'Password must contain at least one uppercase letter, one number, and one special character',
  })
  password: string;

  @IsEnum(UserRole, { message: 'Valid role required' })
  role: UserRole;
}
