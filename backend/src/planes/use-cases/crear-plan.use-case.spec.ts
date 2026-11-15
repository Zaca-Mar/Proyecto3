import { Repository } from 'typeorm';
import { Plan } from '../entities/plan.entity';
import { Molestia } from '../../molestias/entities/molestia.entity';
import { Ejercicio } from '../../catalogo/entities/ejercicio.entity';
import { VinculosService } from '../../common/services/vinculos.service';
import { CrearPlanUseCase } from './crear-plan.use-case';

function crearCaso(molestias: Molestia[] = [], ejercicios: Ejercicio[] = []) {
  const guardados: Plan[] = [];
  let siguienteId = 1;

  const planes = {
    create: (datos: Partial<Plan>) => datos as Plan,
    save: async (plan: Plan) => {
      plan.id = siguienteId++;
      guardados.push(plan);
      return plan;
    },
  } as unknown as Repository<Plan>;

  const repoMolestias = { find: async () => molestias } as unknown as Repository<Molestia>;
  const repoEjercicios = { findBy: async () => ejercicios } as unknown as Repository<Ejercicio>;
  const vinculos = { exigir: jest.fn().mockResolvedValue(undefined) } as unknown as VinculosService;

  const caso = new CrearPlanUseCase(planes, repoMolestias, repoEjercicios, vinculos);
  return { caso, guardados, vinculos };
}

const dto = {
  nombre: 'Fuerza 3 días',
  alumnoId: 7,
  dias: [
    {
      nombre: 'Día 1',
      ejercicios: [
        { ejercicioId: 7, bloque: 'musculacion', series: 3, repMin: 8, repMax: 10, cargaObjetivo: 50, descanso: 90 },
      ],
    },
  ],
};

describe('CrearPlanUseCase', () => {
  it('crea el plan inactivo y ordena días y ejercicios', async () => {
    const { caso, guardados, vinculos } = crearCaso();

    const resultado = await caso.ejecutar(3, dto as never);

    expect(vinculos.exigir).toHaveBeenCalledWith(3, 7);
    expect(resultado.plan).toEqual({ id: 1, nombre: 'Fuerza 3 días' });
    expect(guardados[0].activo).toBe(false);
    expect(guardados[0].dias[0].orden).toBe(0);
    expect(guardados[0].dias[0].ejercicios[0].orden).toBe(0);
  });

  it('devuelve advertencias por molestias sin bloquear la creación', async () => {
    const molestia = { ejercicioId: 7, zona: 'rodilla', observacion: 'molestia' } as Molestia;
    const ejercicio = { id: 7, nombre: 'Sentadilla' } as Ejercicio;
    const { caso, guardados } = crearCaso([molestia], [ejercicio]);

    const resultado = await caso.ejecutar(3, dto as never);

    expect(guardados).toHaveLength(1);
    expect(resultado.advertencias).toHaveLength(1);
    expect(resultado.advertencias[0]).toContain('Sentadilla');
  });
});
