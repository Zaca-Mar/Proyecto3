import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['alumnoId', 'fecha'])
export class Asistencia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  alumnoId: number;

  @Column()
  fecha: string;
}
