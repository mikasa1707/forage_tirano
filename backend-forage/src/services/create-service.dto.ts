import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateServiceDto {
  @IsNotEmpty()
  titre: string;

  @IsNotEmpty()
  description: string;

  @IsOptional()
  image?: string;

  @IsOptional()
  is_active?: number;
}
