import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { RegistrarUsuarioUseCase } from './use-cases/registrar-usuario.use-case';
import { LoginUseCase } from './use-cases/login.use-case';
import { AuthQueryService } from './queries/auth-query.service';

@Module({
  controllers: [AuthController],
  providers: [RegistrarUsuarioUseCase, LoginUseCase, AuthQueryService],
})
export class AuthModule {}
