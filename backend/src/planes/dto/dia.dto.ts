import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { EjercicioPrescriptoDto } from './ejercicio-prescripto.dto';

export class DiaDto {
  @IsNotEmpty({ message: 'Cada día necesita un nombre' })
  nombre: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EjercicioPrescriptoDto)
  ejercicios: EjercicioPrescriptoDto[];
}
