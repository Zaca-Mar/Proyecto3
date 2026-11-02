import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENTIDADES } from './database/entities';
import { VinculosService } from './services/vinculos.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature(ENTIDADES)],
  providers: [VinculosService],
  exports: [TypeOrmModule, VinculosService],
})
export class DbModule {}
