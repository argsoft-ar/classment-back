export const messagingPaths = {
  "/messages": {
    post: {
      tags: ["Messaging"],
      summary: "Publicar comunicado institucional",
      description:
        "targetCourseId null = broadcast global a toda la institución",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo", "Preceptor"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateMessageBody" },
          },
        },
      },
      responses: {
        201: {
          description: "Comunicado publicado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Message" },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
      },
    },
    get: {
      tags: ["Messaging"],
      summary: "Listar comunicados accesibles para el usuario",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "institutionId",
          in: "query",
          required: true,
          schema: { type: "string" },
        },
        {
          name: "courseIds",
          in: "query",
          required: false,
          schema: { type: "string" },
          description: "Comma-separated course IDs",
        },
      ],
      responses: {
        200: {
          description: "Comunicados encontrados",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/Message" },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },
  "/messages/{id}": {
    get: {
      tags: ["Messaging"],
      summary: "Obtener comunicado por ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Comunicado encontrado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Message" },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    delete: {
      tags: ["Messaging"],
      summary: "Eliminar comunicado",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo"],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: { description: "Comunicado eliminado" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/messages/{id}/read": {
    post: {
      tags: ["Messaging"],
      summary: "Marcar comunicado como leído",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: { description: "Marcado como leído" },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
};
