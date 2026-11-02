import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { UsuarioToken } from '../interfaces/usuario-token.interface';

/** Inyecta el usuario que viene en el JWT dentro del handler. */
export const Yo = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UsuarioToken => ctx.switchToHttp().getRequest().user,
);
