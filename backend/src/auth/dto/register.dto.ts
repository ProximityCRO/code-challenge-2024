import { Transform } from 'class-transformer';
import {IsEmail, IsEnum, IsString, MinLength} from 'class-validator';
import {Role} from "../../common/enums/rol.enum";

export class RegisterDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(1)
  name: string;

  @IsEmail()
  email: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(6)
  password: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(6)
  phone_number: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsEnum(Role, { message: 'Role must be one of the following: user, driver, admin' })
  role: Role;
}
