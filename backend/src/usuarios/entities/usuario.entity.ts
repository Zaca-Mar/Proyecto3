import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type Rol = 'alumno' | 'entrenador' | 'admin';

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column({ unique: true })
  dni: string;

  @Column({ nullable: true })
  telefono: string;

  @Column()
  rol: Rol;
}
