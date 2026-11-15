import type { Ejercicio } from './modelos';
import { normalizarZona } from './modelos';

/**
 * Zonas del cuerpo -> grupos musculares que pueden cargarla.
 * Sirve para marcar ejercicios de la biblioteca que no tienen `zonas` cargadas
 * (por ejemplo los ~1000 del seed masivo). Los nombres están normalizados
 * (minúsculas y sin tildes).
 */
const ZONA_A_GRUPOS: Record<string, string[]> = {
  rodilla: [
    'cuadriceps',
    'isquiotibiales',
    'gluteos',
    'pantorrilla',
    'aductores',
    'abductores',
    'soleo',
    'piernas',
    'recto_anterior',
    'puboisquiotibial',
  ],
  hombro: [
    'hombros',
    'deltoides',
    'deltoides_anterior',
    'deltoides_lateral',
    'deltoides_posterior',
    'trapecio',
    'trapecio_superior',
    'trapecio_medio',
    'trapecios',
    'manguito_rotador',
    'pecho',
    'pecho_superior',
    'pecho_inferior',
    'pecho_externo',
    'escapula',
    'romboides',
    'serrato',
    'serratos',
    'dorsal',
    'espalda',
    'espalda_alta',
  ],
  lumbar: [
    'espalda',
    'espalda_baja',
    'espalda_alta',
    'lumbares',
    'cuadrado_lumbar',
    'core',
    'oblicuos',
    'gluteos',
    'gluteos_medios',
    'isquiotibiales',
    'piernas',
    'zona media',
  ],
  cadera: [
    'gluteos',
    'gluteos_medios',
    'aductores',
    'abductores',
    'isquiotibiales',
    'cuadriceps',
    'flexores_cadera',
    'piriforme',
    'cadera',
    'puboisquiotibial',
    'piernas',
    'zona media',
  ],
  codo: ['biceps', 'triceps', 'antebrazos', 'braquiorradial', 'manos', 'brazos'],
  muneca: ['antebrazos', 'muneca', 'manos', 'braquiorradial', 'brazos'],
  cuello: [
    'cuello',
    'trapecio',
    'trapecio_superior',
    'trapecios',
    'suboccipitales',
    'cabeza',
    'espalda_alta',
    'hombros',
    'deltoides',
    'escapula',
  ],
  tobillo: ['pantorrilla', 'soleo', 'tibial_anterior', 'tendon_aquiles', 'tobillo', 'piernas'],
};

/** Zonas (normalizadas) que un ejercicio puede cargar, por zonas propias o por grupo muscular. */
export function zonasQueAfecta(ejercicio: Ejercicio): Set<string> {
  const zonas = new Set<string>();
  for (const zona of ejercicio.zonas ?? []) zonas.add(normalizarZona(zona));

  const grupos = [ejercicio.grupoMuscular, ...(ejercicio.grupoSecundario ?? '').split(',')]
    .filter((grupo): grupo is string => Boolean(grupo))
    .map(normalizarZona);

  for (const [zona, tokens] of Object.entries(ZONA_A_GRUPOS)) {
    if (grupos.some((grupo) => tokens.includes(grupo))) zonas.add(zona);
  }
  return zonas;
}
