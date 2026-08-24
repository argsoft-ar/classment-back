export const rolesPaths = {
  "/roles": {
    post: {
      tags: ["Roles"],
      summary: "Asignar rol a un usuario en una institución",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateRoleBody" },
          },
        },
      },
      responses: {
        201: {
          description: "Rol creado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Role" },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        409: { $ref: "#/components/responses/Conflict" },
      },
    },
  },
  "/roles/institution/{institutionId}": {
    get: {
      tags: ["Roles"],
      summary: "Listar roles de una institución",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo"],
      parameters: [
        {
          name: "institutionId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Roles encontrados",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/Role" },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
      },
    },
  },
  "/roles/{id}": {
    get: {
      tags: ["Roles"],
      summary: "Obtener rol por ID",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo"],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Rol encontrado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Role" },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    patch: {
      tags: ["Roles"],
      summary: "Actualizar rol",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo"],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateRoleBody" },
          },
        },
      },
      responses: {
        200: { description: "Rol actualizado" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
};
