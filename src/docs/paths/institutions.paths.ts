export const institutionsPaths = {
  "/institutions": {
    get: {
      tags: ["Institutions"],
      summary: "Listar instituciones activas",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Lista de instituciones",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/Institution" },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
    post: {
      tags: ["Institutions"],
      summary: "Crear nueva institución",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateInstitutionBody" },
          },
        },
      },
      responses: {
        201: {
          description: "Institución creada",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Institution" },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        409: { $ref: "#/components/responses/Conflict" },
      },
    },
  },
  "/institutions/{id}": {
    get: {
      tags: ["Institutions"],
      summary: "Obtener institución por ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Institución encontrada",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Institution" },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    patch: {
      tags: ["Institutions"],
      summary: "Actualizar institución",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo"],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateInstitutionBody" },
          },
        },
      },
      responses: {
        200: { description: "Institución actualizada" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    delete: {
      tags: ["Institutions"],
      summary: "Desactivar institución",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo"],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: { description: "Institución desactivada" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/institutions/{id}/grading-period/open": {
    post: {
      tags: ["Institutions"],
      summary: "Abrir período de calificaciones",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo"],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: { description: "Período abierto" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/institutions/{id}/grading-period/close": {
    post: {
      tags: ["Institutions"],
      summary: "Cerrar período de calificaciones",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo"],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: { description: "Período cerrado" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
};
