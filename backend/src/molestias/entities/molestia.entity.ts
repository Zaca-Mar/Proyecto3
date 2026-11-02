import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Ejercicio } from '../../catalogo/entities/ejercicio.entity';

@Entity()
export class Molestia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  alumnoId: number;

  @Column()
  ejercicioId: number;

  @ManyToOne(() => Ejercicio, (e) => e.molestias)
  @JoinColumn({ name: 'ejercicioId' })
  ejercicio: Ejercicio;

  @Column()
  zona: string;

  @Column()
  observacion: string;

  @Column({ default: false })
  leida: boolean;

  @CreateDateColumn()
  creada: Date;
}
