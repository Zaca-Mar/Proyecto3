import { IsIn } from 'class-validator';

export class DecidirSugerenciaDto {
  @IsIn(['aprobada', 'rechazada'])
  estado: 'aprobada' | 'rechazada';
}
