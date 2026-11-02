import { IsIn, IsInt, IsNumber, Min } from 'class-validator';
import { Bloque } from '../entities/ejercicio-prescripto.entity';

export class EjercicioPrescriptoDto {
  @IsInt()
  ejercicioId: number;

  @IsIn(['movilidad', 'zona_media', 'musculacion'])
  bloque: Bloque;

  @IsInt()
  @Min(1)
  series: number;

  @IsInt()
  @Min(1)
  repMin: number;

  @IsInt()
  @Min(1)
  repMax: number;

  @IsNumber()
  @Min(0)
  cargaObjetivo: number;

  @IsInt()
  @Min(0)
  descanso: number;
}
