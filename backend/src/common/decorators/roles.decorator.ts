import { SetMetadata } from '@nestjs/common';

/** Restringe una ruta a uno o más roles. */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
