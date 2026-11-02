import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsUrl } from 'class-validator';

export class CrearEjercicioDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsNotEmpty({ message: 'El grupo muscular es obligatorio' })
  grupoMuscular: string;

  @IsOptional()
  @IsUrl({}, { message: 'El link del video no es una URL válida' })
  videoUrl?: string;

  @IsOptional()
  @IsArray()
  zonas?: string[];

  @IsOptional()
  @IsNumber()
  incremento?: number;
}
