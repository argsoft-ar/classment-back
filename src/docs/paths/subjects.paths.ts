export const subjectsPaths = {
  "/subjects": {
    post: {
      tags: ["Subjects"],
      summary: "Crear nueva materia",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateSubjectBody" },
          },
        },
      },
      responses: {
        201: {
          description: "Materia creada",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Subject" },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
      },
    },
  },
  "/subjects/course/{courseId}": {
    get: {
      tags: ["Subjects"],
      summary: "Listar materias de un curso",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "courseId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Materias encontradas",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/Subject" },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },
  "/subjects/teacher/{teacherId}": {
    get: {
      tags: ["Subjects"],
      summary: "Listar materias de un docente",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "teacherId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Materias encontradas",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/Subject" },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },
  "/subjects/{id}": {
    get: {
      tags: ["Subjects"],
      summary: "Obtener materia por ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Materia encontrada",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Subject" },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    patch: {
      tags: ["Subjects"],
      summary: "Actualizar materia",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo"],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateSubjectBody" },
          },
        },
      },
      responses: {
        200: { description: "Materia actualizada" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    delete: {
      tags: ["Subjects"],
      summary: "Desactivar materia",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo"],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: { description: "Materia desactivada" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
};
