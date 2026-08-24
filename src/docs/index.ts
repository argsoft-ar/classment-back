import { authPaths } from "./paths/auth.paths";
import { usersPaths } from "./paths/users.paths";
import { institutionsPaths } from "./paths/institutions.paths";
import { rolesPaths } from "./paths/roles.paths";
import { coursesPaths } from "./paths/courses.paths";
import { subjectsPaths } from "./paths/subjects.paths";
import { academicRecordsPaths } from "./paths/academic-records.paths";
import { attendancePaths } from "./paths/attendance.paths";
import { gradesPaths } from "./paths/grades.paths";
import { messagingPaths } from "./paths/messaging.paths";
import { componentSchemas } from "./components/schemas";
import { commonResponses } from "./components/responses";

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Classment API",
    version: "1.0.0",
    description: `
## Sistema SaaS de Gestión Académica — Módulo Secundaria

### Autenticación
Todos los endpoints (excepto \`/auth\`) requieren un **Bearer JWT** en el header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

### Roles disponibles
| Rol | Descripción |
|-----|-------------|
| **Directivo** | Acceso total. Abre/cierra períodos de calificación. |
| **Preceptor** | Gestiona asistencia y comunicados de sus cursos. |
| **Docente** | Carga calificaciones de sus materias (período abierto). |
| **Alumno** | Solo lectura de su información académica. |

### Convención de asistencia
| Valor | Significado |
|-------|-------------|
| \`0\` | Presente |
| \`0.5\` | Tarde (media falta) |
| \`1\` | Ausente |
    `,
    contact: { name: "ArgSoft", email: "dev@argsoft.ar" },
  },
  servers: [
    { url: "http://localhost:3000/api/v1", description: "Desarrollo local" },
  ],
  tags: [
    { name: "Auth", description: "Registro e inicio de sesión" },
    { name: "Users", description: "Gestión de usuarios" },
    {
      name: "Institutions",
      description: "Gestión de instituciones y períodos de calificación",
    },
    { name: "Roles", description: "Asignación de roles por institución" },
    { name: "Courses", description: "Gestión de cursos y alumnos" },
    { name: "Subjects", description: "Gestión de materias por curso" },
    {
      name: "Academic Records",
      description: "Historial académico y materias previas",
    },
    { name: "Attendance", description: "Registro diario de asistencia" },
    { name: "Grades", description: "Calificaciones por cuatrimestre" },
    { name: "Messaging", description: "Tablón de anuncios institucional" },
  ],
  paths: {
    ...authPaths,
    ...usersPaths,
    ...institutionsPaths,
    ...rolesPaths,
    ...coursesPaths,
    ...subjectsPaths,
    ...academicRecordsPaths,
    ...attendancePaths,
    ...gradesPaths,
    ...messagingPaths,
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
