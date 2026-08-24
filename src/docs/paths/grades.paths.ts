export const gradesPaths = {
  "/grades": {
    post: {
      tags: ["Grades"],
      summary: "Obtener o crear calificación (upsert)",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo", "Docente"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/FindOrCreateGradeBody" },
          },
        },
      },
      responses: {
        200: {
          description: "Calificación encontrada o creada",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Grade" },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
      },
    },
  },
  "/grades/student/{studentId}": {
    get: {
      tags: ["Grades"],
      summary: "Ver calificaciones de un alumno",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo", "Preceptor", "Docente", "Alumno"],
      parameters: [
        {
          name: "studentId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
        {
          name: "academicYear",
          in: "query",
          required: true,
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: {
          description: "Calificaciones encontradas",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/Grade" },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },
  "/grades/subject/{subjectId}": {
    get: {
      tags: ["Grades"],
      summary: "Ver calificaciones de una materia",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo", "Docente"],
      parameters: [
        {
          name: "subjectId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
        {
          name: "academicYear",
          in: "query",
          required: true,
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: { description: "Calificaciones encontradas" },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },
  "/grades/{id}": {
    get: {
      tags: ["Grades"],
      summary: "Obtener calificación por ID",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo", "Preceptor", "Docente", "Alumno"],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Calificación encontrada",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Grade" },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    patch: {
      tags: ["Grades"],
      summary: "Actualizar calificación",
      description:
        "Docentes solo pueden modificar si el período está abierto. Directivo puede siempre (genera log de auditoría).",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo", "Docente"],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateGradeBody" },
          },
        },
      },
      responses: {
        200: { description: "Calificación actualizada" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
};
