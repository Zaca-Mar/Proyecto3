import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Relación entrenador-alumno. Un alumno tiene un solo entrenador. */
@Entity()
export class Vinculo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  entrenadorId: number;

  @Column({ unique: true })
  alumnoId: number;
}
