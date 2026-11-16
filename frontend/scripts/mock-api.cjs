/**
 * API simulada para ver el frontend sin MySQL ni backend.
 *
 * Uso:
 *   1. Terminal 1: yarn mock:api
 *   2. Terminal 2: yarn dev
 *   3. Abrir http://localhost:5173 e ingresar con nicolas.romero@email.com / 1234
 *
 * No reemplaza al backend real: solo devuelve datos de ejemplo para las
 * pantallas del entrenador (Planificador, Alumnos, Molestias, Sugerencias).
 */
const http = require('node:http');

const PORT = Number(process.env.MOCK_PORT || 3000);

const entrenador = {
  id: 2,
  nombre: 'Nicolás',
  apellido: 'Romero',
  email: 'nicolas.romero@email.com',
  dni: '30111222',
  telefono: '3535000000',
  rol: 'entrenador',
};

const alumnos = [
  {
    id: 3,
    nombre: 'Lucas',
    apellido: 'Fernández',
    dni: '40111222',
    email: 'lucas.fernandez@email.com',
    telefono: '3535000001',
  },
  {
    id: 4,
    nombre: 'Martina',
    apellido: 'Gómez',
    dni: '41222333',
    email: 'martina.gomez@email.com',
    telefono: '3535000002',
  },
];

const ejercicios = [
  {
    id: 1,
    nombre: 'Sentadilla con barra',
    grupoMuscular: 'Piernas',
    grupoSecundario: 'Glúteos',
    patron: 'Sentadilla',
    videoUrl: null,
    zonas: ['rodilla', 'cadera'],
    incremento: 2.5,
  },
  {
    id: 2,
    nombre: 'Press de banca',
    grupoMuscular: 'Pecho',
    grupoSecundario: 'Tríceps',
    patron: 'Empuje',
    videoUrl: null,
    zonas: ['hombro'],
    incremento: 2.5,
  },
  {
    id: 3,
    nombre: 'Peso muerto',
    grupoMuscular: 'Espalda',
    grupoSecundario: 'Piernas',
    patron: 'Bisagra',
    videoUrl: null,
    zonas: ['lumbar', 'cadera'],
    incremento: 5,
  },
  {
    id: 4,
    nombre: 'Movilidad de hombro con banda',
    grupoMuscular: 'Movilidad',
    grupoSecundario: null,
    patron: 'Movilidad',
    videoUrl: null,
    zonas: ['hombro'],
    incremento: 0,
  },
  {
    id: 5,
    nombre: 'Plancha frontal',
    grupoMuscular: 'Zona media',
    grupoSecundario: null,
    patron: 'Anti-extensión',
    videoUrl: null,
    zonas: ['lumbar'],
    incremento: 0,
  },
  {
    id: 6,
    nombre: 'Remo con mancuerna',
    grupoMuscular: 'Espalda',
    grupoSecundario: 'Bíceps',
    patron: 'Tracción',
    videoUrl: null,
    zonas: ['codo'],
    incremento: 2,
  },
];

const ejercicioPorId = new Map(ejercicios.map((e) => [e.id, e]));

function prescripto(id, orden, bloque, series, repMin, repMax, cargaObjetivo, descanso, ejercicioId) {
  return {
    id,
    orden,
    bloque,
    series,
    repMin,
    repMax,
    cargaObjetivo,
    descanso,
    ejercicioId,
    ejercicio: ejercicioPorId.get(ejercicioId),
  };
}

const planesDetalle = {
  101: {
    id: 101,
    nombre: 'Fuerza · 3 días',
    entrenadorId: 2,
    alumnoId: 3,
    activo: true,
    creado: '2026-11-02T10:00:00.000Z',
    dias: [
      {
        id: 1001,
        orden: 0,
        nombre: 'Día A · Empuje',
        ejercicios: [
          prescripto(1, 0, 'movilidad', 2, 10, 10, 0, 30, 4),
          prescripto(2, 1, 'zona_media', 3, 30, 30, 0, 60, 5),
          prescripto(3, 2, 'musculacion', 4, 6, 8, 40, 120, 2),
        ],
      },
      {
        id: 1002,
        orden: 1,
        nombre: 'Día B · Piernas',
        ejercicios: [
          prescripto(4, 0, 'movilidad', 2, 10, 10, 0, 30, 4),
          prescripto(5, 1, 'musculacion', 4, 6, 8, 60, 150, 1),
          prescripto(6, 2, 'musculacion', 3, 8, 10, 70, 150, 3),
        ],
      },
      {
        id: 1003,
        orden: 2,
        nombre: 'Día C · Tirón',
        ejercicios: [
          prescripto(7, 0, 'zona_media', 3, 30, 30, 0, 60, 5),
          prescripto(8, 1, 'musculacion', 4, 8, 10, 22.5, 90, 6),
          prescripto(9, 2, 'musculacion', 3, 8, 10, 50, 120, 3),
        ],
      },
    ],
  },
  102: {
    id: 102,
    nombre: 'Hipertrofia · 2 días',
    entrenadorId: 2,
    alumnoId: 3,
    activo: false,
    creado: '2026-10-15T09:30:00.000Z',
    dias: [
      {
        id: 1011,
        orden: 0,
        nombre: 'Día A · Torso',
        ejercicios: [
          prescripto(11, 0, 'musculacion', 4, 8, 12, 35, 90, 2),
          prescripto(12, 1, 'musculacion', 3, 10, 12, 20, 90, 6),
        ],
      },
      {
        id: 1012,
        orden: 1,
        nombre: 'Día B · Piernas',
        ejercicios: [
          prescripto(13, 0, 'musculacion', 4, 8, 12, 55, 120, 1),
          prescripto(14, 1, 'zona_media', 3, 30, 30, 0, 60, 5),
        ],
      },
    ],
  },
  103: {
    id: 103,
    nombre: 'Iniciación · 2 días',
    entrenadorId: 2,
    alumnoId: 4,
    activo: true,
    creado: '2026-11-05T14:15:00.000Z',
    dias: [
      {
        id: 1021,
        orden: 0,
        nombre: 'Día A · Full body',
        ejercicios: [
          prescripto(21, 0, 'movilidad', 2, 10, 10, 0, 30, 4),
          prescripto(22, 1, 'musculacion', 3, 8, 10, 30, 90, 1),
          prescripto(23, 2, 'zona_media', 3, 30, 30, 0, 60, 5),
        ],
      },
      {
        id: 1022,
        orden: 1,
        nombre: 'Día B · Full body',
        ejercicios: [
          prescripto(24, 0, 'musculacion', 3, 8, 10, 22.5, 90, 2),
          prescripto(25, 1, 'musculacion', 3, 10, 12, 18, 90, 6),
        ],
      },
    ],
  },
};

let planes = [
  {
    id: 101,
    nombre: 'Fuerza · 3 días',
    alumnoId: 3,
    activo: true,
    creado: planesDetalle[101].creado,
    dias: 3,
    ejercicios: 9,
  },
  {
    id: 102,
    nombre: 'Hipertrofia · 2 días',
    alumnoId: 3,
    activo: false,
    creado: planesDetalle[102].creado,
    dias: 2,
    ejercicios: 4,
  },
  {
    id: 103,
    nombre: 'Iniciación · 2 días',
    alumnoId: 4,
    activo: true,
    creado: planesDetalle[103].creado,
    dias: 2,
    ejercicios: 5,
  },
];

const molestias = [
  {
    id: 1,
    alumno: 'Lucas Fernández',
    alumnoId: 3,
    ejercicio: 'Press de banca',
    ejercicioId: 2,
    zona: 'hombro',
    observacion: 'Molestia al bajar la barra en las últimas series.',
    leida: false,
    creada: '2026-11-15T18:30:00.000Z',
  },
  {
    id: 2,
    alumno: 'Martina Gómez',
    alumnoId: 4,
    ejercicio: 'Sentadilla con barra',
    ejercicioId: 1,
    zona: 'rodilla',
    observacion: 'Siento una puntada al subir.',
    leida: false,
    creada: '2026-11-14T12:10:00.000Z',
  },
  {
    id: 3,
    alumno: 'Lucas Fernández',
    alumnoId: 3,
    ejercicio: 'Remo con mancuerna',
    ejercicioId: 6,
    zona: 'codo',
    observacion: 'Leve molestia, ya estoy mejor.',
    leida: true,
    creada: '2026-11-10T09:00:00.000Z',
  },
];

function resumenDe(alumnoId) {
  const alumno = alumnos.find((a) => a.id === alumnoId) || alumnos[0];
  const plan = planes.find((p) => p.alumnoId === alumno.id && p.activo) || null;
  const propias = molestias.filter((m) => m.alumnoId === alumno.id);
  const esLucas = alumno.id === 3;

  return {
    alumno,
    esNuevo: !esLucas,
    planActivo: plan ? { id: plan.id, nombre: plan.nombre } : null,
    asistenciaSemana: esLucas ? 3 : 1,
    asistenciaTotal: esLucas ? 42 : 4,
    ultimaSesion: esLucas
      ? { id: 9, fecha: '2026-11-14', series: 18, diaId: 1002 }
      : null,
    ultimasSesiones: esLucas
      ? [
          { id: 9, fecha: '2026-11-14', series: 18, diaId: 1002 },
          { id: 8, fecha: '2026-11-11', series: 15, diaId: 1001 },
          { id: 7, fecha: '2026-11-08', series: 16, diaId: 1003 },
        ]
      : [],
    records: esLucas
      ? {
          'Press de banca': { carga: 60, repeticiones: 8, fecha: '2026-11-14' },
          'Sentadilla con barra': { carga: 80, repeticiones: 6, fecha: '2026-11-11' },
          'Peso muerto': { carga: 100, repeticiones: 5, fecha: '2026-11-08' },
        }
      : {},
    cargasPorEjercicio: esLucas
      ? [
          {
            ejercicioId: 2,
            ejercicio: 'Press de banca',
            grupoMuscular: 'Pecho',
            ultimaCarga: 60,
            mejorCarga: 60,
            series: 12,
            ultimaFecha: '2026-11-14',
          },
          {
            ejercicioId: 1,
            ejercicio: 'Sentadilla con barra',
            grupoMuscular: 'Piernas',
            ultimaCarga: 80,
            mejorCarga: 80,
            series: 16,
            ultimaFecha: '2026-11-11',
          },
          {
            ejercicioId: 3,
            ejercicio: 'Peso muerto',
            grupoMuscular: 'Espalda',
            ultimaCarga: 100,
            mejorCarga: 100,
            series: 8,
            ultimaFecha: '2026-11-08',
          },
        ]
      : [],
    volumenSemanal: esLucas ? { Pecho: 12, Piernas: 18, Espalda: 10 } : { Piernas: 6 },
    molestias: propias,
  };
}

function json(res, status, datos) {
  const cuerpo = JSON.stringify(datos);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(cuerpo),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  });
  res.end(cuerpo);
}

function leerCuerpo(req) {
  return new Promise((resolve) => {
    let datos = '';
    req.on('data', (trozo) => (datos += trozo));
    req.on('end', () => {
      try {
        resolve(datos ? JSON.parse(datos) : {});
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const ruta = url.pathname;
  const metodo = req.method || 'GET';

  if (metodo === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    });
    res.end();
    return;
  }

  if (metodo === 'POST' && ruta === '/auth/login') {
    return json(res, 200, { token: 'token-simulado', usuario: entrenador });
  }
  if (metodo === 'POST' && ruta === '/auth/registro') {
    return json(res, 201, entrenador);
  }
  if (metodo === 'GET' && ruta === '/auth/yo') {
    return json(res, 200, entrenador);
  }
  if (metodo === 'GET' && ruta === '/alumnos') {
    return json(res, 200, alumnos);
  }
  if (metodo === 'GET' && ruta === '/ejercicios') {
    return json(res, 200, ejercicios);
  }
  if (metodo === 'GET' && ruta === '/planes') {
    return json(res, 200, planes);
  }
  if (metodo === 'GET' && ruta === '/molestias') {
    return json(res, 200, molestias);
  }
  if (metodo === 'GET' && ruta === '/sugerencias/pendientes') {
    return json(res, 200, []);
  }
  if (metodo === 'POST' && ruta === '/vinculos') {
    return json(res, 201, { nombre: 'Alumno de prueba' });
  }

  const resumen = ruta.match(/^\/alumnos\/(\d+)\/resumen$/);
  if (metodo === 'GET' && resumen) {
    return json(res, 200, resumenDe(Number(resumen[1])));
  }

  const detalle = ruta.match(/^\/planes\/(\d+)$/);
  if (metodo === 'GET' && detalle) {
    const id = Number(detalle[1]);
    const plan = planesDetalle[id];
    if (!plan) return json(res, 404, { message: 'Plan no encontrado (mock)' });
    return json(res, 200, plan);
  }

  const asignar = ruta.match(/^\/planes\/(\d+)\/asignar$/);
  if (metodo === 'POST' && asignar) {
    const id = Number(asignar[1]);
    const cuerpo = await leerCuerpo(req);
    planes = planes.map((p) => ({
      ...p,
      activo: p.alumnoId === cuerpo.alumnoId ? p.id === id : p.activo,
    }));
    return json(res, 201, { ok: true });
  }

  if (metodo === 'POST' && ruta === '/planes') {
    const cuerpo = await leerCuerpo(req);
    const id = 900 + planes.length;
    const nuevo = {
      id,
      nombre: cuerpo.nombre || 'Plan nuevo',
      entrenadorId: 2,
      alumnoId: cuerpo.alumnoId ?? null,
      activo: false,
      creado: new Date().toISOString(),
      dias: Array.isArray(cuerpo.dias) ? cuerpo.dias : [],
    };
    planesDetalle[id] = {
      ...nuevo,
      dias: nuevo.dias.map((d, i) => ({
        id: id * 10 + i,
        orden: i,
        nombre: d.nombre || `Día ${i + 1}`,
        ejercicios: (d.ejercicios || []).map((e, j) => ({
          ...e,
          id: id * 100 + i * 10 + j,
          orden: j,
          ejercicio: ejercicioPorId.get(e.ejercicioId),
        })),
      })),
    };
    planes = [
      {
        id,
        nombre: nuevo.nombre,
        alumnoId: nuevo.alumnoId,
        activo: false,
        creado: nuevo.creado,
        dias: nuevo.dias.length,
        ejercicios: nuevo.dias.reduce((t, d) => t + (d.ejercicios || []).length, 0),
      },
      ...planes,
    ];
    return json(res, 201, { plan: { id, nombre: nuevo.nombre }, advertencias: [] });
  }

  return json(res, 404, { message: `Ruta no simulada: ${metodo} ${ruta}` });
});

server.listen(PORT, () => {
  console.log(`API simulada de FitTracker escuchando en http://localhost:${PORT}`);
  console.log('Datos de ejemplo listos. No requiere MySQL.');
});
