import { authErrors, bearer, err, jsonBody, ok, pathParam, queryParam } from "./common";

const admin = ["SuperAdmin", "Directivo"];

export const enrollmentPeriodsPaths = {
  "/enrollment-periods/open": {
    get: {
      tags: ["Enrollment Periods"],
      summary: "Períodos abiertos ahora (activos y dentro de [startsAt, endsAt])",
      security: bearer,
      "x-roles": ["SuperAdmin", "Directivo", "Docente", "Alumno"],
      responses: { 200: ok("Períodos abiertos", "EnrollmentPeriod", true), 401: err("Unauthorized") },
    },
  },
  "/enrollment-periods": {
    get: {
      tags: ["Enrollment Periods"],
      summary: "Listar períodos de inscripción",
      security: bearer,
      "x-roles": admin,
      parameters: [
        queryParam("type", { type: "string", enum: ["CURSADA", "FINAL"] }),
        queryParam("academicYear", { type: "integer" }),
      ],
      responses: { 200: ok("Períodos", "EnrollmentPeriod", true), ...authErrors },
    },
    post: {
      tags: ["Enrollment Periods"],
      summary: "Crear período (cursada o turno de final con 1° / 2° llamado)",
      security: bearer,
      "x-roles": admin,
      requestBody: jsonBody("CreateEnrollmentPeriodBody"),
      responses: {
        201: ok("Período creado", "EnrollmentPeriod"),
        400: err("ValidationError"),
        ...authErrors,
      },
    },
  },
  "/enrollment-periods/{id}": {
    get: {
      tags: ["Enrollment Periods"],
      summary: "Obtener período",
      security: bearer,
      "x-roles": admin,
      parameters: [pathParam("id")],
      responses: { 200: ok("Período", "EnrollmentPeriod"), ...authErrors, 404: err("NotFound") },
    },
    patch: {
      tags: ["Enrollment Periods"],
      summary: "Actualizar período (fechas, nombre, activo)",
      security: bearer,
      "x-roles": admin,
      parameters: [pathParam("id")],
      requestBody: jsonBody("UpdateEnrollmentPeriodBody"),
      responses: {
        200: ok("Período actualizado", "EnrollmentPeriod"),
        400: err("ValidationError"),
        ...authErrors,
        404: err("NotFound"),
        422: err("BusinessRule"),
      },
    },
    delete: {
      tags: ["Enrollment Periods"],
      summary: "Eliminar período (solo si no tiene inscripciones)",
      security: bearer,
      "x-roles": admin,
      parameters: [pathParam("id")],
      responses: {
        200: ok("Período eliminado"),
        ...authErrors,
        404: err("NotFound"),
        409: err("Conflict"),
      },
    },
  },
};
