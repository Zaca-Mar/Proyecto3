import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CrearEjercicioUseCase } from './use-cases/crear-ejercicio.use-case';
import { CatalogoQueryService } from './queries/catalogo-query.service';
import { CrearEjercicioDto } from './dto/crear-ejercicio.dto';
import { ListarEjerciciosQueryDto } from './dto/listar-ejercicios-query.dto';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('ejercicios')
export class CatalogoController {
  constructor(
    private readonly crearEjercicio: CrearEjercicioUseCase,
    private readonly catalogo: CatalogoQueryService,
  ) {}

  @Get()
  listar(@Query() query: ListarEjerciciosQueryDto) {
    return this.catalogo.listar(query);
  }

  @Roles('entrenador')
  @Post()
  crear(@Body() dto: CrearEjercicioDto) {
    return this.crearEjercicio.ejecutar(dto);
  }
}
