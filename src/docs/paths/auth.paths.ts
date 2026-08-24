export const authPaths = {
  "/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Registrar un nuevo usuario",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/RegisterBody" },
          },
        },
      },
      responses: {
        201: {
          description: "Usuario registrado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        409: { $ref: "#/components/responses/Conflict" },
        422: { $ref: "#/components/responses/ValidationError" },
      },
    },
  },
  "/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Iniciar sesión y obtener JWT",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/LoginBody" },
          },
        },
      },
      responses: {
        200: {
          description: "Login exitoso",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginResponse" },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        422: { $ref: "#/components/responses/ValidationError" },
      },
    },
  },
};
