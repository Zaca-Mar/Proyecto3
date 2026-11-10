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

## Despliegue en Render + Aiven
Creá una base **MySQL** en Aiven y un Web Service en Render con `backend/` como directorio raíz. Comandos sugeridos:

- Build: `yarn install --frozen-lockfile && yarn build`
- Start: `yarn start:prod`

Configurá estas variables en Render (no subas secretos al repositorio):

- `NODE_ENV=production`
- `DB_TYPE=mysql`, `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` y `DB_DATABASE`: datos de conexión MySQL de Aiven.
- `DB_SSL=true` y `DB_SSL_CA`: habilitan TLS usando el certificado CA de Aiven; la conexión valida el certificado del servidor.
- `JWT_EXPIRATION_ACCESS`: duración del token de acceso (por ejemplo, `7d`).
- `DB_PORT` debe ser el puerto que muestra Aiven (no necesariamente `3306`).
- `JWT_SECRET`: secreto aleatorio de al menos 32 caracteres. Podés generarlo con `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`.
- `CORS_ORIGIN`: origen público del sitio en Netlify, sin ruta (por ejemplo, `https://mi-fittracker.netlify.app`).
- `DB_SYNCHRONIZE=true` solo para el primer inicio, para crear las tablas; después de confirmar el inicio correcto, cambiarlo a `false`. No mantener la sincronización automática del esquema activa en producción; los cambios futuros del esquema deben aplicarse mediante migraciones.

Opcionalmente, para habilitar las funciones de administrador, configurá juntas `INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD` (mínimo 12 caracteres), `INITIAL_ADMIN_NOMBRE`, `INITIAL_ADMIN_APELLIDO` e `INITIAL_ADMIN_DNI`. Se crea ese usuario una sola vez; los usuarios demo con contraseña `1234` no se cargan en producción.

En Netlify, configurá el directorio base `frontend`, comando de build `yarn install --frozen-lockfile && yarn build`, directorio de publicación `dist` y la variable de entorno de build `VITE_API_URL` con la URL pública real de Render (por ejemplo, `https://mi-backend.onrender.com`, sin `/api` ni barra final). Reemplazá el valor de ejemplo de `frontend/.env.production` o definí `VITE_API_URL` en Netlify. En Render, `CORS_ORIGIN` debe coincidir con el dominio Netlify.

Para cargar la biblioteca completa desde los SQL de `backend/seeds/biblioteca/`, iniciá la API una vez para que cree las tablas y luego ejecutá desde `backend/`:

```bash
yarn seed:biblioteca
```

El importador conecta a MySQL usando las mismas variables `DB_*` y es idempotente: conserva los ejercicios existentes y agrega los nuevos. Para verificar los archivos sin modificar la base, usá `yarn seed:biblioteca --check`.

## Usuarios demo

Todas las contraseñas son `1234`.

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
