import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Ejercicio } from '../../catalogo/entities/ejercicio.entity';
import { Dia } from './dia.entity';

export type Bloque = 'movilidad' | 'zona_media' | 'musculacion';

/** Lo que se PIDE (prescripto). Lo que se HACE vive en Sesion/Serie. */
@Entity()
export class EjercicioPrescripto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orden: number;

  @Column()
  bloque: Bloque;

  @Column()
  series: number;

  @Column()
  repMin: number;

  @Column()
  repMax: number;

  @Column('float')
  cargaObjetivo: number;

  @Column()
  descanso: number;

  @Column()
  ejercicioId: number;

  @ManyToOne(() => Ejercicio, (e) => e.prescripciones)
  @JoinColumn({ name: 'ejercicioId' })
  ejercicio: Ejercicio;

  @ManyToOne(() => Dia, (d) => d.ejercicios, { onDelete: 'CASCADE' })
  dia: Dia;
}
