import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseOptions, jwtOptions } from './config/environment.config';
import { DbModule } from './common/database.module';
import { AuthGuard } from './common/guards/auth.guard';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { CatalogoModule } from './catalogo/catalogo.module';
import { PlanesModule } from './planes/planes.module';
import { EntrenamientoModule } from './entrenamiento/entrenamiento.module';
import { MolestiasModule } from './molestias/molestias.module';
import { SeedModule } from './database/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: databaseOptions,
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      global: true,
      useFactory: jwtOptions,
      inject: [ConfigService],
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
