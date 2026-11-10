const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const seedDirectory = path.join(__dirname, '..', 'seeds', 'biblioteca');
const expectedColumns = [
  'entrenador_id',
  'nombre',
  'patron',
  'grupo_muscular',
  'grupo_secundario',
  'tipo',
  'nivel',
  'modalidad',
  'descripcion',
  'consejos_tecnica',
  'youtube_url',
];
const requiredDatabaseColumns = [
  'nombre',
  'grupoMuscular',
  'videoUrl',
  'zonas',
  'incremento',
  'patron',
  'grupoSecundario',
  'tipo',
  'nivel',
  'modalidad',
  'descripcion',
  'consejosTecnica',
];

function parseTuple(contents, start, filePath) {
  let cursor = start;
  let depth = 0;
  let quoted = false;

  for (; cursor < contents.length; cursor += 1) {
    const character = contents[cursor];
    if (character === "'") {
      if (quoted && contents[cursor + 1] === "'") {
        cursor += 1;
      } else {
        quoted = !quoted;
      }
    } else if (!quoted && character === '(') {
      depth += 1;
    } else if (!quoted && character === ')') {
      depth -= 1;
      if (depth === 0) {
        return { values: splitValues(contents.slice(start + 1, cursor), filePath), cursor: cursor + 1 };
      }
    }
  }

  throw new Error(`Tupla incompleta en ${filePath}`);
}

function splitValues(tuple, filePath) {
  const values = [];
  let start = 0;
  let quoted = false;

  for (let cursor = 0; cursor < tuple.length; cursor += 1) {
    if (tuple[cursor] === "'") {
      if (quoted && tuple[cursor + 1] === "'") {
        cursor += 1;
      } else {
        quoted = !quoted;
      }
    } else if (!quoted && tuple[cursor] === ',') {
      values.push(parseValue(tuple.slice(start, cursor), filePath));
      start = cursor + 1;
    }
  }

  if (quoted) throw new Error(`Cadena incompleta en ${filePath}`);
  values.push(parseValue(tuple.slice(start), filePath));
  return values;
}

function parseValue(value, filePath) {
  const trimmed = value.trim();
  if (trimmed.toUpperCase() === 'NULL') return null;
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replace(/''/g, "'");
  }
  if (/^[a-zA-Z_][\w]*$/.test(trimmed)) return trimmed;
  throw new Error(`Valor SQL no soportado (${trimmed}) en ${filePath}`);
}

function skipWhitespaceAndComments(contents, start) {
  let cursor = start;
  while (cursor < contents.length) {
    while (/\s/.test(contents[cursor] ?? '')) cursor += 1;
    if (contents.startsWith('--', cursor)) {
      const newline = contents.indexOf('\n', cursor);
      cursor = newline === -1 ? contents.length : newline + 1;
      continue;
    }
    return cursor;
  }
  return cursor;
}

function readSeedRows() {
  const files = fs
    .readdirSync(seedDirectory)
    .filter((name) => name.endsWith('.sql'))
    .sort();
  if (files.length === 0) throw new Error(`No hay archivos SQL en ${seedDirectory}`);

  const rows = [];
  const insertPattern = /INSERT\s+INTO\s+ejercicios_biblioteca\s*\(([^)]*)\)\s*VALUES\s*/gi;

  for (const file of files) {
    const filePath = path.join(seedDirectory, file);
    const contents = fs.readFileSync(filePath, 'utf8');
    let match;
    let statements = 0;

    while ((match = insertPattern.exec(contents)) !== null) {
      statements += 1;
      const columns = match[1].split(',').map((column) => column.trim().toLowerCase());
      if (columns.join(',') !== expectedColumns.join(',')) {
        throw new Error(`Las columnas de INSERT no coinciden con el formato esperado en ${file}`);
      }

      let cursor = insertPattern.lastIndex;
      while (true) {
        cursor = skipWhitespaceAndComments(contents, cursor);
        if (contents[cursor] !== '(') {
          throw new Error(`Se esperaba una tupla en ${file}:${cursor}`);
        }

        const tuple = parseTuple(contents, cursor, file);
        if (tuple.values.length !== expectedColumns.length) {
          throw new Error(`Cantidad de valores incorrecta en ${file}:${cursor}`);
        }

        const [, nombre, patron, grupoMuscular, grupoSecundario, tipo, nivel, modalidad, descripcion, consejosTecnica, videoUrl] = tuple.values;
        if (typeof nombre !== 'string' || typeof grupoMuscular !== 'string') {
          throw new Error(`Ejercicio sin nombre o grupo muscular en ${file}:${cursor}`);
        }
        rows.push({ nombre, patron, grupoMuscular, grupoSecundario, tipo, nivel, modalidad, descripcion, consejosTecnica, videoUrl });
        cursor = tuple.cursor;

        cursor = skipWhitespaceAndComments(contents, cursor);
        if (contents[cursor] === ',') {
          cursor = skipWhitespaceAndComments(contents, cursor + 1);
          continue;
        }
        if (contents[cursor] !== ';') {
          throw new Error(`Se esperaba el fin del INSERT en ${file}:${cursor}`);
        }
        insertPattern.lastIndex = cursor + 1;
        break;
      }
    }

    if (statements === 0) throw new Error(`No se encontró un INSERT válido en ${file}`);
  }

  return rows;
}

async function main() {
  const rows = readSeedRows();
  const uniqueNames = new Set(rows.map((row) => row.nombre));
  const repeatedNames = rows.length - uniqueNames.size;

  if (process.argv.includes('--check')) {
    console.log(`SQL válido: ${rows.length} ejercicios; ${repeatedNames} nombres repetidos entre archivos.`);
    return;
  }

  const requiredEnvironment = ['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE'];
  const missingEnvironment = requiredEnvironment.filter((name) => !process.env[name]);
  if (missingEnvironment.length > 0) {
    throw new Error(`Faltan variables de conexión MySQL: ${missingEnvironment.join(', ')}`);
  }

  const sslValue = process.env.DB_SSL?.trim().toLowerCase() || 'false';
  const sslEnabled = sslValue === 'true';
  const ca = process.env.DB_SSL_CA?.replace(/\\n/g, '\n').trim();
  if (!['true', 'false'].includes(sslValue)) {
    throw new Error('DB_SSL debe ser "true" o "false"');
  }
  if (process.env.NODE_ENV === 'production' && !sslEnabled) {
    throw new Error('DB_SSL=true es obligatorio en producción');
  }
  if (sslEnabled && !ca) {
    throw new Error('DB_SSL_CA es obligatorio cuando DB_SSL=true');
  }
  const database = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ...(sslEnabled ? { ssl: { ca, rejectUnauthorized: true } } : {}),
  });

  try {
    const [existingColumns] = await database.query('SHOW COLUMNS FROM `ejercicio`');
    const columns = new Set(existingColumns.map((column) => column.Field));
    const missingColumns = requiredDatabaseColumns.filter((column) => !columns.has(column));
    if (missingColumns.length > 0) {
      throw new Error(
        `Faltan columnas en ejercicio (${missingColumns.join(', ')}). Reiniciá la API para sincronizar el esquema actualizado.`,
      );
    }

    await database.beginTransaction();
    let inserted = 0;
    try {
      for (const row of rows) {
        const [insertResult] = await database.execute(`
          INSERT IGNORE INTO ejercicio (
            nombre, grupoMuscular, videoUrl, zonas, incremento, patron,
            grupoSecundario, tipo, nivel, modalidad, descripcion, consejosTecnica
          ) VALUES (?, ?, ?, '[]', 2.5, ?, ?, ?, ?, ?, ?, ?)
        `, [
          row.nombre,
          row.grupoMuscular,
          row.videoUrl,
          row.patron,
          row.grupoSecundario,
          row.tipo,
          row.nivel,
          row.modalidad,
          row.descripcion,
          row.consejosTecnica,
        ]);
        inserted += insertResult.affectedRows;
      }
      await database.commit();
    } catch (error) {
      await database.rollback();
      throw error;
    }
    console.log(`Biblioteca cargada: ${inserted} nuevos; ${rows.length - inserted} ya existían.`);
  } finally {
    await database.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});