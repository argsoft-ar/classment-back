import { authErrors, bearer, err, jsonBody, ok, pathParam, queryParam } from "./common";

const admin = ["SuperAdmin", "Directivo"];

export const offeringsPaths = {
  "/offerings/available": {
    get: {
      tags: ["Offerings"],
      summary: "Oferta abierta para el alumno con validación del motor (Habilitada / Bloqueada)",
      description:
        "Cada oferta incluye `validation` (EnrollmentValidationResult) para la modalidad sugerida y, en mesas de final, `validationByModality` con REGULAR y LIBRE.",
      security: bearer,
      "x-roles": ["Alumno"],
      responses: { 200: ok("Oferta disponible", "AvailableOffering", true), ...authErrors },
    },
  },
  "/offerings": {
    get: {
      tags: ["Offerings"],
      summary: "Listar ofertas (Docente: solo las asignadas)",
      security: bearer,
      "x-roles": [...admin, "Docente"],
      parameters: [queryParam("periodId", { type: "string" }), queryParam("subjectId", { type: "string" })],
      responses: { 200: ok("Ofertas", "Offering", true), ...authErrors },
    },
    post: {
      tags: ["Offerings"],
      summary: "Crear oferta (cursada o mesa de final) para un período",
      security: bearer,
      "x-roles": admin,
      requestBody: jsonBody("CreateOfferingBody"),
      responses: {
        201: ok("Oferta creada", "Offering"),
        400: err("ValidationError"),
        ...authErrors,
        404: err("NotFound"),
        409: err("Conflict"),
        422: err("BusinessRule"),
      },
    },
  },
  "/offerings/{id}": {
    get: {
      tags: ["Offerings"],
      summary: "Obtener oferta",
      security: bearer,
      "x-roles": [...admin, "Docente"],
      parameters: [pathParam("id")],
      responses: { 200: ok("Oferta", "Offering"), ...authErrors, 404: err("NotFound") },
    },
    patch: {
      tags: ["Offerings"],
      summary: "Actualizar oferta (docente, fecha de examen, cupo)",
      security: bearer,
      "x-roles": admin,
      parameters: [pathParam("id")],
      requestBody: jsonBody("UpdateOfferingBody"),
      responses: {
        200: ok("Oferta actualizada", "Offering"),
        400: err("ValidationError"),
        ...authErrors,
        404: err("NotFound"),
        422: err("BusinessRule"),
      },
    },
    delete: {
      tags: ["Offerings"],
      summary: "Eliminar oferta (solo si no tiene inscripciones)",
      security: bearer,
      "x-roles": admin,
      parameters: [pathParam("id")],
      responses: { 200: ok("Oferta eliminada"), ...authErrors, 404: err("NotFound"), 409: err("Conflict") },
    },
  },
  "/offerings/{id}/enrollments": {
    get: {
      tags: ["Offerings"],
      summary: "Nómina de inscriptos (Docente: solo ofertas asignadas)",
      security: bearer,
      "x-roles": [...admin, "Docente"],
      parameters: [pathParam("id")],
      responses: { 200: ok("Inscriptos", "Enrollment", true), ...authErrors, 404: err("NotFound") },
    },
  },
};
