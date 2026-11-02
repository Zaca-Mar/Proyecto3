const yt = (nombre: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(nombre + ' técnica correcta')}`;

/** [nombre, grupo muscular, zonas que carga, incremento] */
export const CATALOGO: [string, string, string[], number][] = [
  ['Movilidad de cadera en cuadrupedia', 'Movilidad', [], 0],
  ['Cadera 90/90', 'Movilidad', ['rodilla', 'cadera'], 0],
  ['Rotación torácica en cuadrupedia', 'Movilidad', [], 0],
  ['Círculos de hombro con banda', 'Movilidad', ['hombro'], 0],
  ['Gato-camello', 'Movilidad', ['lumbar'], 0],
  ['Respiración diafragmática 90/90', 'Movilidad', [], 0],
  ['Dead bug', 'Zona media', [], 0],
  ['Plancha frontal', 'Zona media', ['hombro', 'muñeca'], 0],
  ['Pallof press en polea', 'Zona media', [], 0],
  ['Sentadilla con barra', 'Piernas', ['rodilla', 'lumbar', 'cadera', 'tobillo'], 2.5],
  ['Prensa 45°', 'Piernas', ['rodilla'], 5],
  ['Hip thrust', 'Piernas', ['cadera'], 5],
  ['Puente de glúteos', 'Piernas', [], 5],
  ['Peso muerto rumano', 'Piernas', ['lumbar', 'cadera'], 5],
  ['Curl femoral', 'Piernas', [], 2.5],
  ['Press banca', 'Pecho', ['hombro', 'codo'], 2.5],
  ['Press con mancuernas', 'Pecho', ['hombro', 'codo'], 2],
  ['Press en máquina', 'Pecho', [], 5],
  ['Remo con barra', 'Espalda', ['lumbar'], 2.5],
  ['Jalón al pecho', 'Espalda', [], 2.5],
  ['Remo en máquina', 'Espalda', [], 5],
  ['Press militar', 'Hombros', ['hombro', 'lumbar', 'cuello'], 2.5],
  ['Elevaciones laterales', 'Hombros', ['hombro'], 1],
  ['Curl de bíceps', 'Brazos', ['codo', 'muñeca'], 1],
  ['Face pull con polea', 'Hombros', [], 2.5],
];

export const videoDe = yt;
