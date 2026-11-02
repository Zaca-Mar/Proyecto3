import { Module } from '@nestjs/common';
import { MolestiasController } from './molestias.controller';
import { MolestiasService } from './molestias.service';

@Module({
  controllers: [MolestiasController],
  providers: [MolestiasService],
  exports: [MolestiasService],
})
export class MolestiasModule {}
