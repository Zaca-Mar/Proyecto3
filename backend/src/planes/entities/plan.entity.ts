import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Dia } from './dia.entity';

@Entity()
export class Plan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  entrenadorId: number;

  @Column({ nullable: true })
  alumnoId: number;

  @Column({ default: false })
  activo: boolean;

  @CreateDateColumn()
  creado: Date;

  @OneToMany(() => Dia, (d) => d.plan, { cascade: true })
  dias: Dia[];
}
