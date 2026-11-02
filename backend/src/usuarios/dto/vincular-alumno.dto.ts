import { IsNotEmpty } from 'class-validator';

export class VincularAlumnoDto {
  @IsNotEmpty({ message: 'Ingresá el DNI del alumno' })
  dni: string;
}
