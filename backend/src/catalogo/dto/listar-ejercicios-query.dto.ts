import { IsOptional, IsString } from 'class-validator';

export class ListarEjerciciosQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  grupoMuscular?: string;
}
