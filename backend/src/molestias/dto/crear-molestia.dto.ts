import { IsIn, IsInt, IsNotEmpty, MaxLength } from 'class-validator';
import { ZONAS } from '../../common/constants/zonas';

export class CrearMolestiaDto {
  @IsInt()
  ejercicioId: number;

  @IsIn(ZONAS, { message: 'Elegí una zona del cuerpo de la lista' })
  zona: string;

  @IsNotEmpty({ message: 'Escribí una observación breve' })
  @MaxLength(140, { message: 'Máximo 140 caracteres' })
  observacion: string;
}
