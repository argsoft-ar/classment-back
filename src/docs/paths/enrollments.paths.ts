import { authErrors, bearer, err, jsonBody, ok, pathParam } from "./common";

export const enrollmentsPaths = {
  "/enrollments": {
    post: {
      tags: ["Enrollments"],
      summary: "Inscribirse a una cursada o mesa de final",
      description:
        "El alumno se toma SIEMPRE del JWT (no se acepta studentId en el body). Se valida con el motor de correlatividades; si no se permite responde 422 con `errors.reasons` (todos los motivos). En cursadas, el AcademicRecord pasa a CURSANDO.",
      security: bearer,
      "x-roles": ["Alumno"],
      requestBody: jsonBody("CreateEnrollmentBody"),
      responses: {
        201: ok("Inscripción confirmada", "Enrollment"),
        400: err("ValidationError"),
        ...authErrors,
        404: err("NotFound"),
        409: err("Conflict"),
        422: err("EnrollmentRejected"),
      },
    },
  },
  "/enrollments/me": {
    get: {
      tags: ["Enrollments"],
      summary: "Mis inscripciones",
      security: bearer,
      "x-roles": ["Alumno"],
      responses: { 200: ok("Inscripciones", "Enrollment", true), ...authErrors },
    },
  },
  "/enrollments/{id}/drop": {
    patch: {
      tags: ["Enrollments"],
      summary: "Darse de baja (solo el titular y dentro del período)",
      security: bearer,
      "x-roles": ["Alumno"],
      parameters: [pathParam("id")],
      responses: {
        200: ok("Baja registrada", "Enrollment"),
        ...authErrors,
        404: err("NotFound"),
        409: err("Conflict"),
        422: err("BusinessRule"),
      },
    },
  },
};
