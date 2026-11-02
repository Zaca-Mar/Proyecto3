import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class RegistroDto {
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  email: string;

  @MinLength(4, { message: 'La contraseña debe tener al menos 4 caracteres' })
  password: string;

  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  apellido: string;

  @Matches(/^\d{7,9}$/, { message: 'El DNI debe tener entre 7 y 9 números' })
  dni: string;

  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  telefono: string;
}
