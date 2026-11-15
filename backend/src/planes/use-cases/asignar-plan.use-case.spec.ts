import { Repository } from 'typeorm';
import { Plan } from '../entities/plan.entity';
import { VinculosService } from '../../common/services/vinculos.service';
import { AsignarPlanUseCase } from './asignar-plan.use-case';

function crearCaso() {
  const planes: Plan[] = [
    { id: 1, nombre: 'A', entrenadorId: 3, alumnoId: null, activo: false } as unknown as Plan,
    { id: 2, nombre: 'B', entrenadorId: 3, alumnoId: null, activo: false } as unknown as Plan,
  ];

  const repo = {
    findOneBy: async ({ id }: { id: number }) => planes.find((p) => p.id === id) ?? null,
    update: async (criterio: Partial<Plan>, cambios: Partial<Plan>) => {
      for (const plan of planes) {
        const coincide = Object.entries(criterio).every(
          ([clave, valor]) => (plan as unknown as Record<string, unknown>)[clave] === valor,
        );
        if (coincide) Object.assign(plan, cambios);
      }
    },
    save: async (plan: Plan) => {
      const indice = planes.findIndex((p) => p.id === plan.id);
      planes[indice] = plan;
      return plan;
    },
  } as unknown as Repository<Plan>;

  const vinculos = { exigir: jest.fn().mockResolvedValue(undefined) } as unknown as VinculosService;
  return { caso: new AsignarPlanUseCase(repo, vinculos), planes };
}

describe('AsignarPlanUseCase', () => {
  it('desactiva el plan anterior del alumno al asignar uno nuevo', async () => {
    const { caso, planes } = crearCaso();
    await caso.ejecutar(3, 1, 7);

    expect(planes.find((p) => p.id === 1)?.activo).toBe(true);
    expect(planes.find((p) => p.id === 1)?.alumnoId).toBe(7);
  });

  it('deja un solo plan activo ante asignaciones simultáneas', async () => {
    const { caso, planes } = crearCaso();
    await Promise.all([caso.ejecutar(3, 1, 7), caso.ejecutar(3, 2, 7)]);

    expect(planes.filter((p) => p.alumnoId === 7 && p.activo)).toHaveLength(1);
  });
});
