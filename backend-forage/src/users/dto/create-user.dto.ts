import { IsEnum, IsIn, IsString, MinLength } from 'class-validator';
import { Role } from '../user.interface';


export class CreateUserDto {
  @IsString()
  username!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsEnum(Role)
  role!: Role;
}
