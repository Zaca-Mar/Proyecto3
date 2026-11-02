import { SetMetadata } from '@nestjs/common';

/** Marca una ruta como pública (no exige JWT). */
export const Publica = () => SetMetadata('publica', true);
