import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Completá el email y la contraseña' })
  email: string;

  @IsNotEmpty({ message: 'Completá el email y la contraseña' })
  password: string;
}
