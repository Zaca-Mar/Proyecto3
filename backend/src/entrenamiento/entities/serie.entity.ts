import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Sesion } from './sesion.entity';

@Entity()
export class Serie {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Sesion, (s) => s.series, { onDelete: 'CASCADE' })
  sesion: Sesion;

  @Column()
  ejercicioId: number;

  @Column()
  numero: number;

  @Column('float')
  carga: number;

  @Column()
  repeticiones: number;

  @Column()
  rpe: number;
}
