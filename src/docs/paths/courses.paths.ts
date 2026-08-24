export const coursesPaths = {
  "/courses": {
    post: {
      tags: ["Courses"],
      summary: "Crear nuevo curso",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateCourseBody" },
          },
        },
      },
      responses: {
        201: {
          description: "Curso creado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Course" },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
      },
    },
  },
  "/courses/institution/{institutionId}": {
    get: {
      tags: ["Courses"],
      summary: "Listar cursos de una institución",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo", "Preceptor", "Docente"],
      parameters: [
        {
          name: "institutionId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
        {
          name: "academicYear",
          in: "query",
          required: false,
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: {
          description: "Cursos encontrados",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/Course" },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },
  "/courses/{id}": {
    get: {
      tags: ["Courses"],
      summary: "Obtener curso por ID",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo", "Preceptor", "Docente"],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Curso encontrado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Course" },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    patch: {
      tags: ["Courses"],
      summary: "Actualizar curso",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo"],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateCourseBody" },
          },
        },
      },
      responses: {
        200: { description: "Curso actualizado" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/courses/{id}/students/{studentId}": {
    post: {
      tags: ["Courses"],
      summary: "Agregar alumno a un curso",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo"],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
        {
          name: "studentId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Alumno agregado" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    delete: {
      tags: ["Courses"],
      summary: "Remover alumno de un curso",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo"],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
        {
          name: "studentId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Alumno removido" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
};
