import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CrearPlanUseCase } from './use-cases/crear-plan.use-case';
import { AsignarPlanUseCase } from './use-cases/asignar-plan.use-case';
import { PlanesQueryService } from './queries/planes-query.service';
import { CrearPlanDto } from './dto/crear-plan.dto';
import { AsignarPlanDto } from './dto/asignar-plan.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Yo } from '../common/decorators/yo.decorator';
import { UsuarioToken } from '../common/interfaces/usuario-token.interface';

@Controller('planes')
export class PlanesController {
  constructor(
    private readonly crearPlan: CrearPlanUseCase,
    private readonly asignarPlan: AsignarPlanUseCase,
    private readonly planes: PlanesQueryService,
  ) {}

  @Roles('entrenador')
  @Get()
  listar(@Yo() usuario: UsuarioToken) {
    return this.planes.listar(usuario.sub);
  }

  /** US4: plan del día para el alumno. Va antes de :id para no colisionar. */
  @Roles('alumno')
  @Get('activo')
  activo(@Yo() usuario: UsuarioToken) {
    return this.planes.delDia(usuario.sub);
  }

  @Roles('entrenador')
  @Get(':id')
  obtener(@Yo() usuario: UsuarioToken, @Param('id', ParseIntPipe) id: number) {
    return this.planes.obtener(usuario.sub, id);
  }

  @Roles('entrenador')
  @Post()
  crear(@Yo() usuario: UsuarioToken, @Body() dto: CrearPlanDto) {
    return this.crearPlan.ejecutar(usuario.sub, dto);
  }

  @Roles('entrenador')
  @Post(':id/asignar')
  asignar(
    @Yo() usuario: UsuarioToken,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AsignarPlanDto,
  ) {
    return this.asignarPlan.ejecutar(usuario.sub, id, dto.alumnoId);
  }
}
