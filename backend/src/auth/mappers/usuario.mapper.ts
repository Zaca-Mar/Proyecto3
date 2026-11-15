import { Usuario } from '../../usuarios/entities/usuario.entity';

export type UsuarioPublico = Omit<Usuario, 'passwordHash'>;

/** Quita el hash de la contraseña antes de devolver un usuario por API. */
export function usuarioPublico(usuario: Usuario): UsuarioPublico {
  const { passwordHash, ...resto } = usuario;
  return resto;
}
