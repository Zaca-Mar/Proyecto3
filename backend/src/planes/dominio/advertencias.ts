import { normalizarZona, zonasQueAfecta } from '../../common/lesiones';

export interface MolestiaReportada {
  ejercicioId: number;
  zona: string;
  observacion: string;
}

export interface EjercicioElegido {
  id: number;
  nombre: string;
  zonas?: string[] | null;
  grupoMuscular?: string | null;
  grupoSecundario?: string | null;
}

/**
 * Avisa cuando un ejercicio elegido es el reportado o cuando carga una zona
 * donde el alumno tiene una molestia (leída o sin leer). No bloquea el plan.
 */
export function advertenciasDeMolestias(
  molestias: MolestiaReportada[],
  ejercicios: EjercicioElegido[],
  idsElegidos: number[],
): string[] {
  if (!molestias.length || !idsElegidos.length) return [];

  const zonasPorEjercicio = new Map(
    ejercicios.map((e) => [e.id, zonasQueAfecta(e)]),
  );
  const nombrePorId = new Map(ejercicios.map((e) => [e.id, e.nombre]));

  const advertencias: string[] = [];
  const vistas = new Set<string>();
  for (const molestia of molestias) {
    const zonaMolestia = normalizarZona(molestia.zona);
    for (const id of idsElegidos) {
      const esMismoEjercicio = id === molestia.ejercicioId;
      const afectaZona = (zonasPorEjercicio.get(id) ?? new Set<string>()).has(zonaMolestia);
      if (!esMismoEjercicio && !afectaZona) continue;

      const nombre = nombrePorId.get(id) ?? 'ejercicio';
      const detalle = molestia.observacion ? `: “${molestia.observacion}”` : '';
      const texto = esMismoEjercicio
        ? `Elegiste “${nombre}”, donde el alumno reportó una molestia (${molestia.zona})${detalle}`
        : `“${nombre}” puede afectar la zona ${molestia.zona}, donde el alumno tiene una molestia${detalle}`;
      if (!vistas.has(texto)) {
        vistas.add(texto);
        advertencias.push(texto);
      }
    }
  }
  return advertencias;
}
