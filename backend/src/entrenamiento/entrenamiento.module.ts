import { Module } from '@nestjs/common';
import { AsistenciasController } from './controllers/asistencias.controller';
import { SesionesController } from './controllers/sesiones.controller';
import { SeriesController } from './controllers/series.controller';
import { SugerenciasAlumnoController } from './controllers/sugerencias-alumno.controller';
import { SugerenciasEntrenadorController } from './controllers/sugerencias-entrenador.controller';
import { HistorialController } from './controllers/historial.controller';
import { EstadisticasController } from './controllers/estadisticas.controller';
import { AsistenciasService } from './services/asistencias.service';
import { SesionesService } from './services/sesiones.service';
import { SugerenciasService } from './services/sugerencias.service';
import { HistorialService } from './services/historial.service';
import { EstadisticasService } from './services/estadisticas.service';

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
    AsistenciasService,
    SesionesService,
    SugerenciasService,
    HistorialService,
    EstadisticasService,
  ],
})
export class EntrenamientoModule {}
