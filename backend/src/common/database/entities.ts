import { Asistencia } from '../../entrenamiento/entities/asistencia.entity';
import { Serie } from '../../entrenamiento/entities/serie.entity';
import { Sesion } from '../../entrenamiento/entities/sesion.entity';
import { Sugerencia } from '../../entrenamiento/entities/sugerencia.entity';
import { Molestia } from '../../molestias/entities/molestia.entity';
import { Dia } from '../../planes/entities/dia.entity';
import { EjercicioPrescripto } from '../../planes/entities/ejercicio-prescripto.entity';
import { Plan } from '../../planes/entities/plan.entity';
import { Ejercicio } from '../../catalogo/entities/ejercicio.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Vinculo } from '../../usuarios/entities/vinculo.entity';

export const ENTIDADES = [
  Usuario,
  Vinculo,
  Ejercicio,
  Plan,
  Dia,
  EjercicioPrescripto,
  Sesion,
  Serie,
  Asistencia,
  Molestia,
  Sugerencia,
];
