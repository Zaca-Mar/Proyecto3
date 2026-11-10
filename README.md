# FitTracker

Aplicación de seguimiento de entrenamiento con dos experiencias separadas:

- **Entrenador (escritorio):** panel con barra lateral para gestionar alumnos, leer molestias, revisar sugerencias de carga y **armar planes paso a paso viendo el resumen y las molestias del alumno en la misma pantalla**.
- **Alumno (móvil):** app pensada para el teléfono, con navegación inferior: rutina del día, modo gimnasio, historial y progreso.
- **Administrador:** alta y listado de entrenadores.

## Stack

- `backend/`: **NestJS + TypeORM + MySQL**. JWT, roles y validación global.
- `frontend/`: **React + Vite + TypeScript**. Sin dependencias de ruteo: la navegación se resuelve con estado.

## Requisitos

- Node.js 20 o superior.
- Yarn (`npm install -g yarn` o `corepack enable`).
- Visual Studio Code (recomendado).

## Puesta en marcha

Abrí **dos terminales**.

```bash
# Terminal 1 · API
cd backend
yarn install
# Copiar .env.example a .env y completar la conexión MySQL
yarn start:dev            # http://localhost:3000

# Terminal 2 · Web
cd frontend
yarn install
yarn dev                  # http://localhost:5173
```

Abrí http://localhost:5173.

El frontend toma la URL de la API de `.env.development` al ejecutar Vite y de `.env.production` al compilar para producción. En desarrollo `VITE_API_URL=/api` usa el proxy de Vite; en producción debe ser la URL base de Render, sin `/api` ni barra final. En Netlify, definí también `VITE_API_URL` en las variables de entorno del sitio con la URL real del backend Render; esa variable prevalece sobre el valor de ejemplo del archivo.

En el celular: usá la IP de tu PC con el puerto `5173`, en la misma red WiFi. Vite reenvía las peticiones `/api` al backend local.

En desarrollo, la primera vez que arranca la API con una base MySQL vacía se cargan datos demo (usuarios, ejercicios, un plan, una sesión y molestias). No uses esos usuarios de demostración en producción.

## Variables de entorno

### Backend (`backend/.env`)

El archivo va en `backend/`, junto al `package.json`, codificado en **UTF-8**, con el formato `CLAVE=valor` (sin espacios alrededor del `=`). No se sube a Git: el repositorio incluye `backend/.env.example` como plantilla (`cp .env.example .env`). Al cambiar el `.env` hay que reiniciar `yarn start:dev`, porque el modo watch no lo relee.

| Variable | Obligatoria | Descripción |
|---|---|---|
| `NODE_ENV` | no | `development` (por defecto) o `production`. En producción se exige SSL y `CORS_ORIGIN`. |
| `PORT` | no | Puerto de la API (3000 por defecto). En Render **no se define**: lo asigna la plataforma. |
| `CORS_ORIGIN` | en producción | Orígenes permitidos separados por coma, sin barra final. |
| `DB_TYPE` | no | Solo `mysql`. |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` | sí | Conexión MySQL. |
| `DB_SYNCHRONIZE` | no | `true` crea/actualiza las tablas. Solo para el primer arranque. |
| `DB_SSL` | no | `true` habilita TLS (obligatorio en producción). |
| `DB_SSL_CA` | si `DB_SSL=true` | **Contenido** del certificado CA en una sola línea, con `\n` literales (no la ruta del archivo). |
| `JWT_SECRET` | sí | Mínimo 32 caracteres aleatorios. |
| `JWT_EXPIRATION_ACCESS` | no | Duración del token (`7d` por defecto). |
| `SEED_DEMO_DATA` | no | `false` evita cargar los datos demo en desarrollo. |
| `INITIAL_ADMIN_*` | no | Ver [Primer arranque en producción](#primer-arranque-en-producción). |

Ejemplo para desarrollo local:

```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173

DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_password
DB_DATABASE=fittracker
DB_SYNCHRONIZE=true
DB_SSL=false

JWT_SECRET=una_clave_larga_de_al_menos_32_caracteres
JWT_EXPIRATION_ACCESS=7d
```

Para generar un `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Para convertir el certificado de Aiven al formato de `DB_SSL_CA` (una sola línea):

```powershell
# PowerShell
(Get-Content "ruta\al\ca.pem" -Raw).Trim() -replace "`r?`n", '\n'
```

```bash
# Linux / macOS / Git Bash
awk 'NF {sub(/\r/, ""); printf "%s\\n", $0}' ca.pem
```

### Frontend

`VITE_API_URL` es la única variable. Vite la incorpora **al compilar**, así que cambiarla en Netlify exige un nuevo deploy.

## Despliegue en Aiven + Render + Netlify

El orden recomendado es base de datos, backend y frontend.

### 1. Base de datos (Aiven)

1. Creá un servicio **MySQL**.
2. En *Overview* copiá host, puerto, usuario, contraseña y nombre de la base (suele ser `avnadmin` y `defaultdb`). El puerto **no** es `3306`.
3. Descargá el **CA certificate** (`ca.pem`).
4. En *Allowed IP addresses* dejá `0.0.0.0/0`: Render usa IPs variables.

### 2. Backend (Render)

Creá un Web Service con `backend/` como *Root Directory*:

| Campo | Valor |
|---|---|
| Build Command | `yarn install --frozen-lockfile --production=false && yarn build` |
| Start Command | `yarn start:prod` |

`--production=false` es necesario porque Render define `NODE_ENV=production` y yarn omitiría las devDependencies, donde están el CLI de Nest y TypeScript. `start:prod` ejecuta `node dist/main.js`; si el build deja el archivo en otra ruta (por ejemplo `dist/src/main.js`), ajustá el script.

Variables en Render (no subas secretos al repositorio):

```env
NODE_ENV=production
DB_TYPE=mysql
DB_HOST=...            # host de Aiven
DB_PORT=...            # puerto de Aiven
DB_USERNAME=avnadmin
DB_PASSWORD=...
DB_DATABASE=defaultdb
DB_SSL=true
DB_SSL_CA=-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----
DB_SYNCHRONIZE=true    # solo el primer inicio; después, false
JWT_SECRET=...         # mínimo 32 caracteres aleatorios
JWT_EXPIRATION_ACCESS=7d
CORS_ORIGIN=https://mi-fittracker.netlify.app
```

- No definas `PORT`.
- `DB_SYNCHRONIZE=true` solo para crear las tablas en el primer inicio. Después de confirmar que arrancó (en los logs aparece `API de FitTracker escuchando en el puerto ...`), cambialo a `false`: los cambios futuros del esquema deben aplicarse mediante migraciones.
- El plan gratuito de Render duerme el servicio tras unos 15 minutos sin uso; la primera petición posterior puede tardar entre 30 y 60 segundos.

### 3. Frontend (Netlify)

Directorio base `frontend`, comando de build `yarn install --frozen-lockfile && yarn build`, directorio de publicación `dist`, y la variable de entorno de build `VITE_API_URL` con la URL pública del backend (por ejemplo `https://mi-backend.onrender.com`, sin `/api` ni barra final). Esa variable prevalece sobre el valor de ejemplo de `frontend/.env.production`. Después de crearla o cambiarla, usá *Deploys → Trigger deploy → Clear cache and deploy site*.

En Render, `CORS_ORIGIN` debe coincidir exactamente con el dominio de Netlify.

## Primer arranque en producción

En producción **no se cargan** los usuarios demo ni el catálogo. Hay que preparar cuatro cosas.

### 1. Tablas

Con `DB_SYNCHRONIZE=true` en el primer inicio, TypeORM las crea. Si más adelante `yarn seed:biblioteca` informa `Faltan columnas en ejercicio (...)`, repetí este paso para que se agreguen y volvé a ponerlo en `false`.

### 2. Administrador

Opción A: configurá juntas, en Render, las cinco variables:

```env
INITIAL_ADMIN_EMAIL=admin@ejemplo.com
INITIAL_ADMIN_PASSWORD=...        # mínimo 12 caracteres
INITIAL_ADMIN_NOMBRE=...
INITIAL_ADMIN_APELLIDO=...
INITIAL_ADMIN_DNI=...
```

Se crea una sola vez, al arrancar. El email **no** puede pertenecer a un usuario existente que no sea administrador (la API no arranca y lo informa). Si falta alguna de las cinco variables, tampoco arranca.

Opción B: registrá una cuenta desde la app y promovela por SQL:

```sql
UPDATE usuario SET rol = 'admin' WHERE email = 'tu-email';
```

Cerrá sesión y volvé a entrar para que el token tome el rol nuevo.

### 3. Entrenadores

El administrador los crea desde la app (*Administrador → Crear entrenador*). Si necesitás crear usuarios directamente en la base, generá el hash con bcrypt:

```bash
cd backend
node -e "console.log(require('bcryptjs').hashSync('TuClave', 10))"
```

e insertalo en la columna `passwordHash`. Al pegar el hash tené cuidado con los espacios o saltos de línea que se cuelan, y no lo uses dentro de comillas dobles en PowerShell (los `$` se interpretan como variables). Un hash válido mide **60 caracteres**:

```sql
SELECT email, LENGTH(passwordHash) FROM usuario;
```

### 4. Biblioteca de ejercicios

Los archivos de `backend/seeds/biblioteca/*.sql` tienen sintaxis tipo PostgreSQL (`DO $$ ... RAISE NOTICE`) y **no se pueden ejecutar** directamente en MySQL ni en Workbench. Los importa `yarn seed:biblioteca`, que los parsea y los inserta en la tabla `ejercicio` (unos 1000 ejercicios).

Para verificar los archivos sin tocar ninguna base:

```bash
yarn seed:biblioteca --check
```

Para cargar la base de Aiven desde tu PC, definí la conexión **solo en esa terminal** (dotenv no pisa variables ya definidas, así que el `.env` local no se modifica ni la contraseña queda guardada en un archivo). Desde `backend/`:

```powershell
# PowerShell
$env:DB_HOST="host-de-aiven"
$env:DB_PORT="puerto-de-aiven"
$env:DB_USERNAME="avnadmin"
$env:DB_PASSWORD="password-de-aiven"
$env:DB_DATABASE="defaultdb"
$env:DB_SSL="true"
$env:DB_SSL_CA = (Get-Content "ruta\al\ca.pem" -Raw).Trim() -replace "`r?`n", '\n'

yarn seed:biblioteca
```

```bash
# bash
export DB_HOST=host-de-aiven DB_PORT=puerto-de-aiven DB_USERNAME=avnadmin \
       DB_PASSWORD=password-de-aiven DB_DATABASE=defaultdb DB_SSL=true
export DB_SSL_CA="$(awk 'NF {sub(/\r/, ""); printf "%s\\n", $0}' ca.pem)"

yarn seed:biblioteca
```

Notas:

- Tarda unos minutos y no muestra progreso: inserta los ejercicios de a uno, dentro de una única transacción. Hasta que termina, la tabla se ve vacía. Al final imprime `Biblioteca cargada: N nuevos; M ya existían.`
- Usa `INSERT IGNORE`, por lo que solo evita duplicados si existe un índice único sobre `ejercicio.nombre`. Verificalo con `SHOW INDEX FROM ejercicio;` y, si falta, agregalo antes de cargar: `ALTER TABLE ejercicio ADD UNIQUE KEY uq_ejercicio_nombre (nombre);`
- Hay unos 16 nombres repetidos entre los archivos; se cargan una sola vez.
- Cerrá la terminal al terminar para que desaparezcan las variables. Si la contraseña de Aiven apareció en capturas, chats o commits, rotala desde el panel de Aiven y actualizala en Render.

## Solución de problemas

| Síntoma | Causa y solución |
|---|---|
| `DB_HOST es obligatorio` al arrancar | La API no ve el `.env`. Verificá que esté en `backend/` (junto al `package.json`), que no se llame `.env.txt`, que esté en UTF-8 (no UTF-16) y que el nombre de la variable coincida exactamente. Probá `node -e "require('dotenv').config(); console.log(process.env.DB_HOST)"` y reiniciá `yarn start:dev`. |
| `self-signed certificate in certificate chain` | Hay `DB_SSL=true` apuntando a una base que no es Aiven (por ejemplo `localhost`) o `DB_SSL_CA` es incorrecto. En local usá `DB_SSL=false`. Para Aiven, `DB_SSL_CA` debe ser el **contenido** del certificado en una sola línea con `\n`. |
| `DB_SSL=true es obligatorio en producción` | Falta `DB_SSL=true` en Render. |
| `DB_SSL_CA es obligatorio cuando DB_SSL=true` | La variable está vacía o no se definió. |
| Login con `401` en producción | Los usuarios demo no existen en producción. Creá el administrador (ver arriba). Si lo insertaste por SQL, comprobá que el hash mida 60 caracteres. |
| Error de CORS en el navegador | `CORS_ORIGIN` no coincide exactamente con el dominio de Netlify (sin barra final). |
| El sitio llama a una URL equivocada | `VITE_API_URL` mal definida o sin redeploy. Se aplica al compilar: hacé *Clear cache and deploy site*. |
| `Cannot find module .../dist/main.js` | El build compila a otra ruta. Revisá qué hay en `dist/` y ajustá `start:prod`. |
| `Faltan columnas en ejercicio (...)` | La tabla es de una versión anterior. Activá `DB_SYNCHRONIZE=true` un inicio, volvé a `false` y repetí `yarn seed:biblioteca`. |
| `yarn seed` → `Command "seed" not found` | El script se llama `yarn seed:biblioteca`. |
| La primera petición tarda casi un minuto | El plan gratuito de Render duerme el servicio por inactividad. |

## Usuarios demo

Solo existen en **desarrollo** (no se cargan en producción) y únicamente si la tabla `usuario` está vacía al arrancar. Todas las contraseñas son `1234`.

| Rol | Email | Notas |
|---|---|---|
| Alumno | `lucas.fernandez@email.com` | Vinculado a Nicolás. Tiene plan, sesiones y molestias. |
| Alumno | `martina.gomez@email.com` | DNI `41222333`. Sirve para probar la vinculación. |
| Entrenador | `nicolas.romero@email.com` | Tiene alumnos y planes. |
| Administrador | `admin@fittracker.com` | Crea entrenadores. |

## Recorrido sugerido

### Entrenador

1. Ingresá con `nicolas.romero@email.com`.
2. **Planificador**: elegí un alumno en las fichas de arriba.
3. En la columna derecha vas a ver asistencias, plan activo, **molestias sin leer**, cargas, récords y volumen semanal.
4. En el editor: poné nombre al plan, agregá días y sumá ejercicios desde la biblioteca. La biblioteca marca con ⚑ los ejercicios que tienen molestias pendientes.
5. Ajustá bloque, series, reps, carga y descanso por ejercicio. Reordená con ↑/↓ o quitá con ✕.
6. **Crear y asignar plan**. El plan anterior queda inactivo y el historial se conserva. Si elegiste un ejercicio con molestia sin leer, el backend devuelve una advertencia sin bloquear.
7. Revisá **Molestias** (marcar como leída) y **Sugerencias** (aprobar/rechazar).
8. **Alumnos** permite vincular por DNI y entrar directo al planificador.
9. **Catálogo** permite sumar ejercicios nuevos a la biblioteca.

### Alumno

1. Ingresá con `lucas.fernandez@email.com`.
2. **Hoy**: registrá asistencia y revisá la rutina del día agrupada por movilidad, zona media y musculación.
3. Podés reportar una molestia por ejercicio (zona + observación de hasta 140 caracteres) y marcar movilidad/zona media como hecha.
4. **Empezar musculación** abre el modo gimnasio: carga, repeticiones, RPE obligatorio, edición de series, temporizador de descanso y cambio rápido de ejercicio.
5. Al cerrar la sesión aparece el resumen con las sugerencias de progresión para la próxima vez.
6. **Historial**: evolución por ejercicio, series de cada sesión y récord personal.
7. **Progreso**: gráfico de carga máxima por sesión, volumen semanal por grupo muscular y asistencias (7/30 días/total).

### Administrador

1. Ingresá con `admin@fittracker.com`.
2. Creá entrenadores con nombre, apellido, DNI, teléfono, email y contraseña inicial.
3. El listado muestra los entrenadores activos.

## Estructura del backend

Cada módulo separa entidad, DTO, servicio y controlador.

```text
backend/src/
├── auth/                 # login, registro, alta de entrenadores
├── usuarios/             # vínculos, alumnos, resumen del alumno
│   ├── dto/
│   ├── services/
│   └── usuarios.controller.ts
├── catalogo/             # ejercicios
│   ├── dto/
│   ├── entities/
│   ├── catalogo.controller.ts
│   └── catalogo.service.ts
├── planes/               # plan, día y ejercicio prescripto
│   ├── dto/
│   ├── entities/
│   ├── planes.controller.ts
│   └── planes.service.ts
├── entrenamiento/        # asistencia, sesión, series, historial, estadísticas, sugerencias
│   ├── dto/
│   ├── entities/
│   ├── services/
│   └── controllers/
├── molestias/            # reportes de molestias
├── progresion/           # motor puro de doble progresión + tests
├── common/               # guards, decoradores, fechas, zonas, entidades y vínculos
└── database/             # seed y datos demo
```

## Estructura del frontend

```text
frontend/src/
├── api.ts                # cliente fetch + mensajes de error
├── auth.tsx              # contexto de sesión (localStorage)
├── tipos.ts              # tipos de la API y borradores del editor
├── formato.ts            # fechas en es-AR
├── estilos.css           # sistema visual completo (desktop + móvil)
├── App.tsx               # deriva al layout según el rol
└── paginas/
    ├── Login.tsx
    ├── admin/AdminApp.tsx
    ├── entrenador/
    │   ├── EntrenadorApp.tsx          # shell con barra lateral
    │   ├── PlanificadorPage.tsx       # alumno + editor + resumen en 3 columnas
    │   ├── AlumnosPage.tsx
    │   ├── MolestiasPage.tsx
    │   ├── CatalogoPage.tsx
    │   ├── SugerenciasPage.tsx
    │   └── componentes/
    │       ├── EditorPlan.tsx
    │       ├── SelectorEjercicios.tsx
    │       └── ResumenAlumno.tsx
    └── alumno/
        ├── AlumnoApp.tsx              # shell móvil + navegación inferior
        ├── Hoy.tsx
        ├── Gym.tsx
        ├── Historial.tsx
        ├── Progreso.tsx
        ├── ResumenSesion.tsx
        └── componentes/ModalMolestia.tsx
```

## Endpoints principales

| Método y ruta | Quién | Uso |
|---|---|---|
| `POST /auth/registro`, `POST /auth/login` | público | Registro de alumno / inicio de sesión |
| `GET /auth/yo` | autenticado | Usuario de la sesión |
| `POST /auth/entrenadores`, `GET /auth/entrenadores` | admin | Alta y listado de entrenadores |
| `POST /vinculos` `{dni}` | entrenador | Vincular alumno por DNI |
| `GET /alumnos`, `GET /alumnos/:id/resumen` | entrenador | Listado y resumen con molestias/cargas/récords |
| `GET /ejercicios`, `POST /ejercicios` | autenticado / entrenador | Catálogo |
| `GET /planes`, `GET /planes/:id` | entrenador | Planes creados y detalle |
| `POST /planes`, `POST /planes/:id/asignar` | entrenador | Crear y asignar plan |
| `GET /planes/activo` | alumno | Plan y día actual |
| `GET /asistencias/hoy`, `POST /asistencias` | alumno | Asistencia diaria |
| `GET /sesiones/actual`, `POST /sesiones/iniciar` | alumno | Sesión abierta / iniciar |
| `POST /sesiones/:id/series`, `PATCH /series/:id`, `POST /sesiones/:id/cerrar` | alumno | Registro de series y cierre |
| `GET /sugerencias` | alumno | Sugerencias propias |
| `GET /sugerencias/pendientes`, `PATCH /sugerencias/:id` | entrenador | Revisar propuestas |
| `GET /historial`, `GET /historial/:ejercicioId` | alumno | Historial y récord |
| `GET /estadisticas` | alumno | Carga por sesión, volumen semanal y asistencias |
| `POST /molestias`, `GET /molestias/mias` | alumno | Reportar y ver molestias |
| `GET /molestias`, `PATCH /molestias/:id/leida` | entrenador | Bandeja de molestias |

## Decisiones técnicas

- **Snapshot del plan en la sesión:** al iniciar una sesión se copia lo prescripto. Editar o reemplazar el plan después no altera el historial.
- **Un solo plan activo por alumno:** asignar uno nuevo desactiva el anterior.
- **Progresión:** el motor (`backend/src/progresion/engine.ts`) propone subir, mantener o bajar según carga, repeticiones y RPE. Las sugerencias quedan pendientes de aprobación del entrenador.
- **Molestias:** no bloquean la creación del plan ni recomiendan alternativas automáticamente. El entrenador recibe advertencias y decide.
- **Roles:** `admin`, `entrenador`, `alumno`, validados por un guard global con decoradores `@Publica` y `@Roles`.
- **Base de datos:** MySQL en desarrollo y producción; `synchronize` se activa explícitamente con `DB_SYNCHRONIZE=true` y debe desactivarse después de la creación inicial. Los cambios futuros del esquema deben aplicarse mediante migraciones.

## Tests y build

```bash
cd backend
yarn test
yarn build

cd ../frontend
yarn build
```

El backend incluye la tabla de casos del motor de doble progresión. El build del frontend corre `tsc -b` y Vite.
