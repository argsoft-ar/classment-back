import { authErrors, bearer, err, jsonBody, ok } from "./common";

export const authPaths = {
  "/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Iniciar sesión (email + contraseña) y obtener JWT",
      description:
        "Instalación de institución única: no se envía institutionId. Solo usuarios ACTIVE pueden ingresar. Email inexistente, contraseña incorrecta o cuenta no ACTIVE responden el mismo 401 `Invalid credentials`. JWT HS256 (iss `classment-api`, aud `classment-web`, vence según `JWT_EXPIRES_IN`, por defecto 8h) con payload { userId, role, email, tv }; el servidor revalida usuario, estado y `tv` (tokenVersion) contra la base en cada request. Rate limit: 10 intentos / 15 min por IP + email → 429.",
      requestBody: jsonBody("LoginBody"),
      responses: {
        200: {
          description: "Login exitoso",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginResponse" },
            },
          },
        },
        400: err("ValidationError"),
        401: err("InvalidCredentials"),
        429: err("TooManyRequests"),
      },
    },
  },
  "/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Registrar un usuario con contraseña (alta administrada)",
      description:
        "Sin auto-registro abierto. Solo SuperAdmin/Directivo. Crear un Directivo requiere SuperAdmin. Los alumnos requieren careerId.",
      security: bearer,
      "x-roles": ["SuperAdmin", "Directivo"],
      requestBody: jsonBody("RegisterBody"),
      responses: {
        201: ok("Usuario registrado", "User"),
        400: err("ValidationError"),
        ...authErrors,
        409: err("Conflict"),
      },
    },
  },
};
