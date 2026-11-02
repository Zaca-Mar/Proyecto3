import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CatalogoService } from './catalogo.service';
import { CrearEjercicioDto } from './dto/crear-ejercicio.dto';
import { ListarEjerciciosQueryDto } from './dto/listar-ejercicios-query.dto';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('ejercicios')
export class CatalogoController {
  constructor(private readonly catalogo: CatalogoService) {}

  @Get()
  listar(@Query() query: ListarEjerciciosQueryDto) {
    return this.catalogo.listar(query);
  }

  @Roles('entrenador')
  @Post()
  crear(@Body() dto: CrearEjercicioDto) {
    return this.catalogo.crear(dto);
  }
}
