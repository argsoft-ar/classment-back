import { authPaths } from "./paths/auth.paths";
import { institutionPaths } from "./paths/institution.paths";
import { usersPaths } from "./paths/users.paths";
import { careersPaths } from "./paths/careers.paths";
import { subjectsPaths } from "./paths/subjects.paths";
import { correlativesPaths } from "./paths/correlatives.paths";
import { academicRecordsPaths } from "./paths/academic-records.paths";
import { enrollmentPeriodsPaths } from "./paths/enrollment-periods.paths";
import { offeringsPaths } from "./paths/offerings.paths";
import { enrollmentsPaths } from "./paths/enrollments.paths";
import { componentSchemas } from "./components/schemas";
import { commonResponses } from "./components/responses";

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Classment API",
    version: "1.0.0",
    description: `
## Classment — Gestión Académica Nivel Terciario (Fase 0 · Demo Comercial)

Instalación de **institución única**: la configuración (nota de aprobación, validación de correlativas en finales, etc.) se lee de \`GET /institution\`.

### Autenticación
Todos los endpoints (excepto \`POST /auth/login\`) requieren un **Bearer JWT**:
\`\`\`
Authorization: Bearer <token>
\`\`\`

### Roles
| Rol | Descripción |
|-----|-------------|
| **SuperAdmin** | Todo lo del Directivo + configuración institucional y alta de Directivos. |
| **Directivo** | Carreras, materias, correlatividades, alumnos, historial ("Día Cero"), períodos y ofertas. |
| **Docente** | Lectura de sus ofertas asignadas y nómina de inscriptos. |
| **Alumno** | Su avance, oferta disponible (validada por el motor) e inscripciones/bajas propias. |

### Motor de correlatividades
Las inscripciones rechazadas responden **422** con \`errors: { allowed: false, reasons: RejectionReason[] }\` listando **todos** los motivos.
    `,
    contact: { name: "ArgSoft", email: "dev@argsoft.ar" },
  },
  servers: [
    { url: "http://localhost:3000/api/v1", description: "Desarrollo local" },
  ],
  tags: [
    { name: "Auth", description: "Inicio de sesión y alta administrada" },
    { name: "Institution", description: "Configuración de la institución" },
    { name: "Users", description: "Usuarios (Directivos, Docentes, Alumnos)" },
    { name: "Careers", description: "Carreras y plan de estudios" },
    { name: "Subjects", description: "Materias anuales" },
    { name: "Correlatives", description: "Reglas de correlatividad (con detección de ciclos)" },
    { name: "Academic Records", description: "Avance del alumno y grilla \"Día Cero\"" },
    { name: "Enrollment Periods", description: "Períodos de cursada y turnos de final" },
    { name: "Offerings", description: "Cursadas y mesas ofrecidas por período" },
    { name: "Enrollments", description: "Inscripciones y bajas del alumno" },
  ],
  paths: {
    ...authPaths,
    ...institutionPaths,
    ...usersPaths,
    ...careersPaths,
    ...subjectsPaths,
    ...correlativesPaths,
    ...academicRecordsPaths,
    ...enrollmentPeriodsPaths,
    ...offeringsPaths,
    ...enrollmentsPaths,
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: componentSchemas,
    responses: commonResponses,
  },
};
