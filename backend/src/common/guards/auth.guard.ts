import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

/**
 * Guard global: toda ruta exige JWT salvo las marcadas con @Publica().
 * Además valida el rol cuando la ruta usa @Roles(...).
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly ref: Reflector,
  ) {}

  canActivate(ctx: ExecutionContext): boolean {
    const objetivos = [ctx.getHandler(), ctx.getClass()];
    if (this.ref.getAllAndOverride('publica', objetivos)) return true;

    const req = ctx.switchToHttp().getRequest();
    const header: string = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Tenés que iniciar sesión');
    }

    try {
      req.user = this.jwt.verify(header.slice(7));
    } catch {
      throw new UnauthorizedException('Sesión inválida o vencida');
    }

    const roles = this.ref.getAllAndOverride<string[]>('roles', objetivos);
    if (roles && !roles.includes(req.user.rol)) {
      throw new ForbiddenException('No tenés permiso para esta acción');
    }
    return true;
  }
}
