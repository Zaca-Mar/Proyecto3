import { Module } from '@nestjs/common';
import { AsistenciasController } from './controllers/asistencias.controller';
import { SesionesController } from './controllers/sesiones.controller';
import { SeriesController } from './controllers/series.controller';
import { SugerenciasAlumnoController } from './controllers/sugerencias-alumno.controller';
import { SugerenciasEntrenadorController } from './controllers/sugerencias-entrenador.controller';
import { HistorialController } from './controllers/historial.controller';
import { EstadisticasController } from './controllers/estadisticas.controller';
import { RegistrarAsistenciaUseCase } from './use-cases/registrar-asistencia.use-case';
import { IniciarSesionUseCase } from './use-cases/iniciar-sesion.use-case';
import { AgregarSerieUseCase } from './use-cases/agregar-serie.use-case';
import { EditarSerieUseCase } from './use-cases/editar-serie.use-case';
import { CerrarSesionUseCase } from './use-cases/cerrar-sesion.use-case';
import { DecidirSugerenciaUseCase } from './use-cases/decidir-sugerencia.use-case';
import { AsistenciasQueryService } from './queries/asistencias-query.service';
import { SesionesQueryService } from './queries/sesiones-query.service';
import { SugerenciasQueryService } from './queries/sugerencias-query.service';
import { HistorialQueryService } from './queries/historial-query.service';
import { EstadisticasQueryService } from './queries/estadisticas-query.service';

@Module({
  controllers: [
    AsistenciasController,
    SesionesController,
    SeriesController,
    SugerenciasAlumnoController,
    SugerenciasEntrenadorController,
    HistorialController,
    EstadisticasController,
  ],
  providers: [
    RegistrarAsistenciaUseCase,
    IniciarSesionUseCase,
    AgregarSerieUseCase,
    EditarSerieUseCase,
    CerrarSesionUseCase,
    DecidirSugerenciaUseCase,
    AsistenciasQueryService,
    SesionesQueryService,
    SugerenciasQueryService,
    HistorialQueryService,
    EstadisticasQueryService,
  ],
})
export class EntrenamientoModule {}
