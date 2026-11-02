import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Plan } from './plan.entity';
import { EjercicioPrescripto } from './ejercicio-prescripto.entity';

@Entity()
export class Dia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orden: number;

  @Column()
  nombre: string;

  @ManyToOne(() => Plan, (p) => p.dias, { onDelete: 'CASCADE' })
  plan: Plan;

  @OneToMany(() => EjercicioPrescripto, (e) => e.dia, { cascade: true })
  ejercicios: EjercicioPrescripto[];
}
