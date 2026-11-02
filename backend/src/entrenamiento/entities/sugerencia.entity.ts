import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Sugerencia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  alumnoId: number;

  @Column()
  ejercicioId: number;

  @Column()
  ejercicioNombre: string;

  @Column()
  sesionId: number;

  @Column()
  accion: string;

  @Column('float')
  carga: number;

  @Column()
  repsObjetivo: number;

  @Column()
  explicacion: string;

  @Column('text', { nullable: true })
  aviso: string | null;

  @Column({ default: 'pendiente' })
  estado: 'pendiente' | 'aprobada' | 'rechazada';
}
