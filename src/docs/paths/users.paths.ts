import { authErrors, bearer, err, jsonBody, ok, pathParam, queryParam } from "./common";

const admin = ["SuperAdmin", "Directivo"];

export const usersPaths = {
  "/users/me": {
    get: {
      tags: ["Users"],
      summary: "Obtener el usuario autenticado",
      security: bearer,
      "x-roles": ["SuperAdmin", "Directivo", "Docente", "Alumno"],
      responses: { 200: ok("Usuario actual", "User"), 401: err("Unauthorized") },
    },
  },
  "/users": {
    get: {
      tags: ["Users"],
      summary: "Listar usuarios",
      security: bearer,
      "x-roles": admin,
      parameters: [
        queryParam("role", { type: "string", enum: ["SuperAdmin", "Directivo", "Docente", "Alumno"] }),
        queryParam("status", { type: "string", enum: ["INVITED", "ACTIVE", "INACTIVE"] }),
        queryParam("careerId", { type: "string" }, "Filtra alumnos inscriptos en la carrera"),
      ],
      responses: { 200: ok("Usuarios", "User", true), ...authErrors },
    },
    post: {
      tags: ["Users"],
      summary: "Crear usuario (alumno: DNI + nombre + email + carrera)",
      description:
        "Si se omite password, el usuario queda INVITED (no puede ingresar). Para Alumno, careerId es obligatorio y se crea el vínculo StudentCareer con el plan activo. Solo SuperAdmin puede crear Directivos.",
      security: bearer,
      "x-roles": admin,
      requestBody: jsonBody("CreateUserBody"),
      responses: {
        201: ok("Usuario creado", "User"),
        400: err("ValidationError"),
        ...authErrors,
        404: err("NotFound"),
        409: err("Conflict"),
      },
    },
  },
  "/users/{id}": {
    get: {
      tags: ["Users"],
      summary: "Obtener usuario por ID",
      security: bearer,
      "x-roles": admin,
      parameters: [pathParam("id")],
      responses: { 200: ok("Usuario", "User"), ...authErrors, 404: err("NotFound") },
    },
    patch: {
      tags: ["Users"],
      summary: "Actualizar usuario",
      description: "Modificar Directivos/SuperAdmins requiere SuperAdmin.",
      security: bearer,
      "x-roles": admin,
      parameters: [pathParam("id")],
      requestBody: jsonBody("UpdateUserBody"),
      responses: {
        200: ok("Usuario actualizado", "User"),
        400: err("ValidationError"),
        ...authErrors,
        404: err("NotFound"),
        409: err("Conflict"),
        422: err("BusinessRule"),
      },
    },
    delete: {
      tags: ["Users"],
      summary: "Desactivar usuario (status INACTIVE)",
      description: "Revoca inmediatamente todos los tokens emitidos del usuario (tokenVersion++).",
      security: bearer,
      "x-roles": admin,
      parameters: [pathParam("id")],
      responses: { 200: ok("Usuario desactivado"), ...authErrors, 404: err("NotFound") },
    },
  },
};
