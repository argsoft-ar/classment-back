import { authErrors, bearer, err, jsonBody, ok, pathParam } from "./common";

export const academicRecordsPaths = {
  "/academic-records/me": {
    get: {
      tags: ["Academic Records"],
      summary: "Mi avance en la carrera (agrupado por año, incluye SIN_CURSAR)",
      security: bearer,
      "x-roles": ["Alumno"],
      responses: { 200: ok("Avance del alumno", "StudentProgress"), ...authErrors },
    },
  },
  "/academic-records/student/{studentId}": {
    get: {
      tags: ["Academic Records"],
      summary: "Avance de un alumno por materia (agrupado por año)",
      description: "Un Alumno solo puede consultar su propio legajo.",
      security: bearer,
      "x-roles": ["SuperAdmin", "Directivo", "Alumno"],
      parameters: [pathParam("studentId")],
      responses: {
        200: ok("Avance del alumno", "StudentProgress"),
        ...authErrors,
        404: err("NotFound"),
      },
    },
    put: {
      tags: ["Academic Records"],
      summary: "Grilla rápida \"Día Cero\": carga masiva de historial previo",
      description:
        "Upsert por materia. `SIN_CURSAR` elimina el registro (rechazado con 409 si el alumno tiene una inscripción ACTIVA en esa materia). `EQUIVALENCIA` solo con APROBADA. regularizedAt / approvedAt se completan automáticamente.",
      security: bearer,
      "x-roles": ["SuperAdmin", "Directivo"],
      parameters: [pathParam("studentId")],
      requestBody: jsonBody("BulkUpsertRecordsBody"),
      responses: {
        200: ok("Historial actualizado", "StudentProgress"),
        400: err("ValidationError"),
        ...authErrors,
        404: err("NotFound"),
        409: err("Conflict"),
        422: err("BusinessRule"),
      },
    },
  },
};
