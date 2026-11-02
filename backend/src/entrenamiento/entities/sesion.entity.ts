import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Serie } from './serie.entity';

export interface PrescriptoSnapshot {
  ejercicioId: number;
  nombre: string;
  grupoMuscular: string;
  bloque: string;
  series: number;
  repMin: number;
  repMax: number;
  cargaObjetivo: number;
  descanso: number;
  incremento: number;
}

@Entity()
export class Sesion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  alumnoId: number;

  @Column()
  planId: number;

  @Column()
  diaId: number;

  @Column()
  fecha: string;

  @Column({ default: 'abierta' })
  estado: 'abierta' | 'cerrada';

  /** Copia de lo prescripto al iniciar: el historial no cambia si el plan se edita. */
  @Column('simple-json')
  prescripto: PrescriptoSnapshot[];

  @OneToMany(() => Serie, (s) => s.sesion)
  series: Serie[];
}
