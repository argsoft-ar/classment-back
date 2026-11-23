import { authErrors, bearer, err, jsonBody, ok, pathParam } from "./common";

const admin = ["SuperAdmin", "Directivo"];
const all = ["SuperAdmin", "Directivo", "Docente", "Alumno"];

export const careersPaths = {
  "/careers": {
    get: {
      tags: ["Careers"],
      summary: "Listar carreras activas",
      security: bearer,
      "x-roles": all,
      responses: { 200: ok("Carreras", "Career", true), 401: err("Unauthorized") },
    },
    post: {
      tags: ["Careers"],
      summary: "Crear carrera (crea automáticamente su plan de estudios activo)",
      security: bearer,
      "x-roles": admin,
      requestBody: jsonBody("CreateCareerBody"),
      responses: { 201: ok("Carrera creada", "Career"), 400: err("ValidationError"), ...authErrors },
    },
  },
  "/careers/{id}": {
    get: {
      tags: ["Careers"],
      summary: "Obtener carrera por ID",
      security: bearer,
      "x-roles": all,
      parameters: [pathParam("id")],
      responses: { 200: ok("Carrera", "Career"), 401: err("Unauthorized"), 404: err("NotFound") },
    },
    patch: {
      tags: ["Careers"],
      summary: "Actualizar carrera",
      security: bearer,
      "x-roles": admin,
      parameters: [pathParam("id")],
      requestBody: jsonBody("UpdateCareerBody"),
      responses: {
        200: ok("Carrera actualizada", "Career"),
        400: err("ValidationError"),
        ...authErrors,
        404: err("NotFound"),
        422: err("BusinessRule"),
      },
    },
    delete: {
      tags: ["Careers"],
      summary: "Desactivar carrera",
      security: bearer,
      "x-roles": admin,
      parameters: [pathParam("id")],
      responses: { 200: ok("Carrera desactivada"), ...authErrors, 404: err("NotFound") },
    },
  },
  "/careers/{id}/subjects": {
    get: {
      tags: ["Careers"],
      summary: "Materias del plan activo agrupadas por año (con correlatividades)",
      security: bearer,
      "x-roles": all,
      parameters: [pathParam("id")],
      responses: {
        200: ok("Plan de estudios por año", "CareerCurriculum"),
        401: err("Unauthorized"),
        404: err("NotFound"),
      },
    },
  },
};
