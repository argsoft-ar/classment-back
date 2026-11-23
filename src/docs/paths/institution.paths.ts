import { authErrors, bearer, err, jsonBody, ok } from "./common";

export const institutionPaths = {
  "/institution": {
    get: {
      tags: ["Institution"],
      summary: "Obtener la configuración de la institución",
      security: bearer,
      "x-roles": ["SuperAdmin", "Directivo", "Docente", "Alumno"],
      responses: {
        200: ok("Configuración de la institución", "Institution"),
        401: err("Unauthorized"),
      },
    },
    patch: {
      tags: ["Institution"],
      summary: "Actualizar la configuración de la institución",
      security: bearer,
      "x-roles": ["SuperAdmin"],
      requestBody: jsonBody("UpdateInstitutionBody"),
      responses: {
        200: ok("Configuración actualizada", "Institution"),
        400: err("ValidationError"),
        ...authErrors,
        422: err("BusinessRule"),
      },
    },
  },
};
