import { authErrors, bearer, err, jsonBody, ok, pathParam } from "./common";

const admin = ["SuperAdmin", "Directivo"];

export const correlativesPaths = {
  "/correlatives/subject/{subjectId}": {
    get: {
      tags: ["Correlatives"],
      summary: "Correlatividades de una materia (requisitos y materias que la requieren)",
      security: bearer,
      "x-roles": ["SuperAdmin", "Directivo", "Docente", "Alumno"],
      parameters: [pathParam("subjectId")],
      responses: {
        200: ok("Correlatividades", "SubjectCorrelatives"),
        401: err("Unauthorized"),
        404: err("NotFound"),
      },
    },
  },
  "/correlatives": {
    post: {
      tags: ["Correlatives"],
      summary: "Crear regla de correlatividad",
      description:
        "Ejecuta detección de ciclos (DFS). 422 si la materia se requiere a sí misma o pertenece a otro plan; 409 si la regla ya existe o genera un ciclo (A -> B -> A). En caso de ciclo, `errors.path` contiene el recorrido.",
      security: bearer,
      "x-roles": admin,
      requestBody: jsonBody("CreateCorrelativeBody"),
      responses: {
        201: ok("Regla creada", "CorrelativeRule"),
        400: err("ValidationError"),
        ...authErrors,
        404: err("NotFound"),
        409: err("Conflict"),
        422: err("BusinessRule"),
      },
    },
  },
  "/correlatives/{id}": {
    delete: {
      tags: ["Correlatives"],
      summary: "Eliminar regla de correlatividad",
      security: bearer,
      "x-roles": admin,
      parameters: [pathParam("id")],
      responses: { 200: ok("Regla eliminada"), ...authErrors, 404: err("NotFound") },
    },
  },
};
