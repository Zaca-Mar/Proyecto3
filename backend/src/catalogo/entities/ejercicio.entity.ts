import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EjercicioPrescripto } from '../../planes/entities/ejercicio-prescripto.entity';
import { Molestia } from '../../molestias/entities/molestia.entity';

@Entity()
export class Ejercicio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string;

  @Column()
  grupoMuscular: string;

  @Column({ nullable: true })
  videoUrl: string;

  /** Zonas del cuerpo que carga el ejercicio (rodilla, hombro, lumbar...). */
  @Column('simple-json')
  zonas: string[];

  @Column('float', { default: 2.5 })
  incremento: number;

  @OneToMany(() => EjercicioPrescripto, (e) => e.ejercicio)
  prescripciones: EjercicioPrescripto[];

  @OneToMany(() => Molestia, (m) => m.ejercicio)
  molestias: Molestia[];
}
