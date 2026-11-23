# classment-back

API de **Classment** — gestión académica de **nivel terciario** (Fase 0 · Demo Comercial).
Express + TypeScript + Prisma (PostgreSQL). Una sola institución por instalación.

Especificación funcional: `../gestion-academica/README.md` (secciones 4–7).

## Puesta en marcha

```bash
docker compose up -d                 # Postgres en localhost:5433
cp .env.example .env                 # completar JWT_SECRET (ver abajo)
npm install
npx prisma migrate reset --force     # aplica migraciones + seed de demo
npm run dev                          # http://localhost:3000/api/v1  ·  Swagger: /docs (solo fuera de producción)
npm test                             # tests del motor de correlatividades + utils (Vitest)
```

### Variables de entorno (`.env.example`)

| Variable | Default | Descripción |
|----------|---------|-------------|
| `NODE_ENV` | `development` | En `production` no se monta `/docs` y el seed demo se niega a correr. |
| `PORT` | `3000` | |
| `DATABASE_URL` | — (obligatoria) | PostgreSQL. |
| `JWT_SECRET` | — (obligatoria) | **Mínimo 32 caracteres**; el servidor no arranca con el placeholder. Generar con `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`. |
| `JWT_EXPIRES_IN` | `8h` | Vigencia del token (formato `jsonwebtoken`, ej. `8h`, `30m`). |
| `BCRYPT_ROUNDS` | `12` | |
| `CORS_ORIGINS` | `http://localhost:5173` | Orígenes permitidos, separados por coma. Otros orígenes no reciben `Access-Control-Allow-Origin`. |
| `LOGIN_RATE_LIMIT_MAX` | `10` | Intentos de login permitidos por ventana (IP + email). |
| `LOGIN_RATE_LIMIT_WINDOW_MS` | `900000` | Ventana del rate limit de login (15 min). |
| `ALLOW_DEMO_SEED` | — | Solo para forzar el seed demo con `NODE_ENV=production` (`true`). **Borra todos los datos.** |

## Seguridad

- **JWT:** HS256 fijo, `iss=classment-api`, `aud=classment-web`, vence según `JWT_EXPIRES_IN` (8h por defecto). Payload `{ userId, role, email, tv }`; `role`/`email` son informativos para el front.
- **Revocación:** `authMiddleware` recarga el usuario de la base en cada request (rol, email, estado y `tokenVersion`). Responde 401 si el usuario no existe, no está `ACTIVE` o `tv` ≠ `tokenVersion`. `tokenVersion` se incrementa al desactivar (`DELETE /users/:id`), al cambiar `status` y al cambiar la contraseña → todos los tokens previos dejan de valer al instante.
- **Login:** email inexistente, sin contraseña, contraseña incorrecta o cuenta no `ACTIVE` → mismo `401 Invalid credentials`, siempre con una comparación bcrypt (sin enumeración por tiempo de respuesta).
- **Rate limit de login:** `POST /auth/login` admite 10 intentos cada 15 minutos por **IP + email** (en minúsculas); el exceso responde `429` con el sobre `{ success: false, message }` y headers `RateLimit-*`. El store es en memoria (por proceso): con varias réplicas usar un store compartido (Redis).
- **`trust proxy`:** **no** está habilitado. Si la API se despliega detrás de un reverse proxy / load balancer, configurar `app.set("trust proxy", N)` en `src/config/app.ts` con la **cantidad exacta de saltos** (ej. `1` detrás de un único Nginx). Sin eso todas las requests parecen venir de la IP del proxy (el rate limit se compartiría entre usuarios); con un valor mayor al real un cliente podría falsear su IP vía `X-Forwarded-For`.
- **HTTP:** `helmet`, `x-powered-by` deshabilitado, CORS restringido a `CORS_ORIGINS` (métodos GET/POST/PUT/PATCH/DELETE, headers `Content-Type`/`Authorization`). JSON malformado → 400 `Malformed JSON`; body demasiado grande (>100kb) → 413.
- **Validación:** todos los bodies son `.strict()` (campos desconocidos → 400), ids `cuid`, límites de longitud (nombres 120, email 254, password 72, dirección 200, códigos 50) y fechas de períodos/mesas dentro de ±5 años.
- **Seed:** `prisma/seed.ts` aborta si `NODE_ENV=production` salvo `ALLOW_DEMO_SEED=true`.

## Arquitectura

```
src/
  domain/correlatives/  Motor puro (sin Express/Prisma): validateEnrollment, detectCycle + tests
  routes/               Router + authMiddleware + rbacMiddleware + validateBody/Params/Query (Zod)
  controllers/          request -> service -> sendSuccess
  services/             reglas de negocio + Prisma (lanzan AppError)
  schemas/              Zod
  interfaces/           tipos de respuesta
  docs/                 OpenAPI (Swagger)
prisma/
  schema.prisma         Institution, User, Career, StudyPlan, Subject, CorrelativeRule,
                        StudentCareer, AcademicRecord, EnrollmentPeriod, Offering, Enrollment
  migrations/           init_terciario + integrity_constraints (CHECK + índice único parcial) + token_version
  seed.ts               datos demo (idempotente: vacía las tablas antes de cargar)
```

- **Login:** `email + password`. JWT = `{ userId, role, email, tv }` (ver *Seguridad*). Solo usuarios `ACTIVE` pueden ingresar.
- **Institución:** fila única de configuración (`passingGrade`, `validateFinalCorrelatives`, ...) leída por los servicios vía `institutionService.getConfig()`.
- **Errores:** `{ success: false, message, errors? }`. Inscripción rechazada → **422** con `errors: { allowed: false, reasons: RejectionReason[] }` (todos los motivos).

## Roles

| Rol | Valor | Permisos |
|-----|-------|----------|
| SUPER_ADMIN | `SuperAdmin` | Todo + `PATCH /institution` + alta/edición de Directivos |
| DIRECTIVO | `Directivo` | Carreras, materias, correlatividades, usuarios (no Directivos), historial "Día Cero", períodos, ofertas |
| DOCENTE | `Docente` | Lectura de sus ofertas asignadas y nómina de inscriptos |
| ALUMNO | `Alumno` | Su avance, oferta disponible validada, inscripción y baja propias |

## Endpoints (`/api/v1`)

| Método | Ruta | Roles |
|--------|------|-------|
| POST | `/auth/login` | público |
| POST | `/auth/register` | SuperAdmin, Directivo |
| GET | `/institution` | todos |
| PATCH | `/institution` | SuperAdmin |
| GET | `/users/me` | todos |
| GET / POST | `/users` | SuperAdmin, Directivo |
| GET / PATCH / DELETE | `/users/:id` | SuperAdmin, Directivo |
| GET | `/careers` | todos |
| POST | `/careers` | SuperAdmin, Directivo |
| GET | `/careers/:id` | todos |
| PATCH / DELETE | `/careers/:id` | SuperAdmin, Directivo |
| GET | `/careers/:id/subjects` | todos |
| GET | `/subjects?careerId=` | todos |
| POST | `/subjects` | SuperAdmin, Directivo |
| GET | `/subjects/:id` | todos |
| PATCH / DELETE | `/subjects/:id` | SuperAdmin, Directivo |
| GET | `/correlatives/subject/:subjectId` | todos |
| POST | `/correlatives` | SuperAdmin, Directivo |
| DELETE | `/correlatives/:id` | SuperAdmin, Directivo |
| GET | `/academic-records/me` | Alumno |
| GET | `/academic-records/student/:studentId` | SuperAdmin, Directivo, Alumno (solo propio) |
| PUT | `/academic-records/student/:studentId` | SuperAdmin, Directivo |
| GET | `/enrollment-periods/open` | todos |
| GET / POST | `/enrollment-periods` | SuperAdmin, Directivo |
| GET / PATCH / DELETE | `/enrollment-periods/:id` | SuperAdmin, Directivo |
| GET | `/offerings/available` | Alumno |
| GET | `/offerings` | SuperAdmin, Directivo, Docente (solo asignadas) |
| POST | `/offerings` | SuperAdmin, Directivo |
| GET | `/offerings/:id`, `/offerings/:id/enrollments` | SuperAdmin, Directivo, Docente (solo asignadas) |
| PATCH / DELETE | `/offerings/:id` | SuperAdmin, Directivo |
| POST | `/enrollments` | Alumno (studentId siempre desde el JWT) |
| GET | `/enrollments/me` | Alumno |
| PATCH | `/enrollments/:id/drop` | Alumno (titular, dentro del período) |

## Cuentas demo (solo para la demo — datos ficticios)

| Rol | Email | Contraseña |
|-----|-------|------------|
| SuperAdmin | `superadmin@classment.demo` | `SuperAdmin123!` |
| Directivo | `directivo@classment.demo` | `Directivo123!` |
| Docente | `docente1@classment.demo` / `docente2@classment.demo` | `Docente123!` |
| Alumno (2° año, demo principal) | `alumno1@classment.demo` | `Alumno123!` |
| Alumno (1° año, cursando) | `alumno2@classment.demo` | `Alumno123!` |
| Alumno (3° año) | `alumno3@classment.demo` | `Alumno123!` |

## Guión de demo con el seed

Carrera **Tecnicatura Superior en Análisis de Sistemas** (3 años, 5 materias por año). Los períodos se crean con fechas relativas al momento del seed, así que siempre están abiertos:
*Inscripción a Cursadas (próximo año)* y *Turno Diciembre — 1° Llamado* (mesas con `examDate`).

1. **Directivo:** `GET /careers/:id/subjects` → Programación II requiere Programación I `REGULARIZADA`; Programación III requiere Programación I `APROBADA` **y** Programación II `REGULARIZADA`.
2. **Grilla "Día Cero":** `PUT /academic-records/student/:id` con `APROBADA` / `REGULARIZADA` / `EQUIVALENCIA`.
3. **Alumno (`alumno1`):** `GET /offerings/available`
   - Programación II → **Habilitada** → `POST /enrollments` = 201.
   - Programación III → **Bloqueada** → `POST /enrollments` = 422 con 2 motivos (`Requiere Programación I APROBADA (estado actual: REGULARIZADA)`, `Requiere Programación II REGULARIZADA (...)`).
   - Mesas: Programación I como **Regular** (habilitada); Matemática II como **Libre** (habilitada).
4. **Cierre en vivo:** Ingeniería de Software está bloqueada (requiere Análisis de Sistemas I `APROBADA`). El Directivo carga Análisis de Sistemas I como `APROBADA` / `EQUIVALENCIA` y el alumno ya puede inscribirse.

## Tests

`npm test` corre Vitest sobre `src/**/*.test.ts`: el motor de correlatividades (`src/domain/correlatives`), que cubre los 7 casos obligatorios del README funcional (§7): cadena de regularidad, jerarquía APROBADA, múltiples requisitos (motivos exhaustivos), ciclos, anti-duplicados, final Regular vs. Libre (+ `validateFinalCorrelatives`) y ventana temporal; y los helpers puros de configuración (`env.utils`) y rate limit (`rate-limit.utils`).
