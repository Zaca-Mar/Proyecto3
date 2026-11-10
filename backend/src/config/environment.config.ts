import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ENTIDADES } from '../common/database/entities';

function required(config: ConfigService, name: string): string {
  const value = config.get<string>(name)?.trim();
  if (!value) throw new Error(`${name} es obligatorio`);
  return value;
}

export function databaseOptions(config: ConfigService): TypeOrmModuleOptions {
  const production = config.get<string>('NODE_ENV') === 'production';
  const type = config.get<string>('DB_TYPE')?.trim().toLowerCase() || 'mysql';
  const sslValue = config.get<string>('DB_SSL')?.trim().toLowerCase() || 'false';
  const sslEnabled = sslValue === 'true';
  const ssl = sslEnabled
    ? {
        ca: required(config, 'DB_SSL_CA').replace(/\\n/g, '\n'),
        rejectUnauthorized: true,
      }
    : undefined;
  const synchronize = config.get<string>('DB_SYNCHRONIZE')?.trim().toLowerCase() || 'false';

  if (type !== 'mysql') {
    throw new Error('DB_TYPE debe ser "mysql"');
  }
  if (!['true', 'false'].includes(sslValue)) {
    throw new Error('DB_SSL debe ser "true" o "false"');
  }
  if (!['true', 'false'].includes(synchronize)) {
    throw new Error('DB_SYNCHRONIZE debe ser "true" o "false"');
  }
  if (production && !sslEnabled) {
    throw new Error('DB_SSL=true es obligatorio en producción');
  }
  const port = Number(config.get<string>('DB_PORT') || 3306);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('DB_PORT debe ser un puerto válido');
  }

  return {
    type: 'mysql',
    host: required(config, 'DB_HOST'),
    port,
    username: required(config, 'DB_USERNAME'),
    password: required(config, 'DB_PASSWORD'),
    database: required(config, 'DB_DATABASE'),
    ...(ssl ? { ssl } : {}),
    entities: ENTIDADES,
    synchronize: synchronize === 'true',
  };
}

export function jwtOptions(config: ConfigService) {
  const secret = required(config, 'JWT_SECRET');
  if (secret.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres');
  }
  const expiresIn = config.get<string>('JWT_EXPIRATION_ACCESS')?.trim() || '7d';
  return { secret, signOptions: { expiresIn } };
}
