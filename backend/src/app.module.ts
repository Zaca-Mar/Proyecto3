import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbModule } from './common/database.module';
import { AuthGuard } from './common/guards/auth.guard';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { CatalogoModule } from './catalogo/catalogo.module';
import { PlanesModule } from './planes/planes.module';
import { EntrenamientoModule } from './entrenamiento/entrenamiento.module';
import { MolestiasModule } from './molestias/molestias.module';
import { SeedModule } from './database/seed.module';
import { ENTIDADES } from './common/database/entities';

@Module({
  imports: [
    // SQLite para desarrollo (sin instalar nada). Para PostgreSQL: type 'postgres' + host/usuario/contraseña.
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'fittracker.db',
      autoLoadEntities: false,
      entities: ENTIDADES,
      synchronize: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'dev-secret-cambiar-en-produccion',
      signOptions: { expiresIn: '7d' },
    }),
    DbModule,
    AuthModule,
    UsuariosModule,
    CatalogoModule,
    PlanesModule,
    EntrenamientoModule,
    MolestiasModule,
    SeedModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
