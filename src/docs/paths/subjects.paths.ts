import { authErrors, bearer, err, jsonBody, ok, pathParam, queryParam } from "./common";

const admin = ["SuperAdmin", "Directivo"];
const all = ["SuperAdmin", "Directivo", "Docente", "Alumno"];

export const subjectsPaths = {
  "/subjects": {
    get: {
      tags: ["Subjects"],
      summary: "Listar materias del plan activo de una carrera",
      security: bearer,
      "x-roles": all,
      parameters: [queryParam("careerId", { type: "string" }, "Carrera", true)],
      responses: {
        200: ok("Materias", "Subject", true),
        400: err("ValidationError"),
        401: err("Unauthorized"),
        404: err("NotFound"),
      },
    },
    post: {
      tags: ["Subjects"],
      summary: "Crear materia anual en el plan activo de la carrera",
      security: bearer,
      "x-roles": admin,
      requestBody: jsonBody("CreateSubjectBody"),
      responses: {
        201: ok("Materia creada", "Subject"),
        400: err("ValidationError"),
        ...authErrors,
        404: err("NotFound"),
        422: err("BusinessRule"),
      },
    },
  },
  "/subjects/{id}": {
    get: {
      tags: ["Subjects"],
      summary: "Obtener materia (incluye correlativas y materias que la requieren)",
      security: bearer,
      "x-roles": all,
      parameters: [pathParam("id")],
      responses: { 200: ok("Materia", "Subject"), 401: err("Unauthorized"), 404: err("NotFound") },
    },
    patch: {
      tags: ["Subjects"],
      summary: "Actualizar materia",
      security: bearer,
      "x-roles": admin,
      parameters: [pathParam("id")],
      requestBody: jsonBody("UpdateSubjectBody"),
      responses: {
        200: ok("Materia actualizada", "Subject"),
        400: err("ValidationError"),
        ...authErrors,
        404: err("NotFound"),
        422: err("BusinessRule"),
      },
    },
    delete: {
      tags: ["Subjects"],
      summary: "Desactivar materia",
      security: bearer,
      "x-roles": admin,
      parameters: [pathParam("id")],
      responses: { 200: ok("Materia desactivada"), ...authErrors, 404: err("NotFound") },
    },
  },
};
