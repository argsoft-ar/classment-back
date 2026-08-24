export const academicRecordsPaths = {
  "/academic-records": {
    post: {
      tags: ["Academic Records"],
      summary: "Crear historial académico de un alumno",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateAcademicRecordBody" },
          },
        },
      },
      responses: {
        201: {
          description: "Historial creado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AcademicRecord" },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        409: { $ref: "#/components/responses/Conflict" },
      },
    },
  },
  "/academic-records/student/{studentId}": {
    get: {
      tags: ["Academic Records"],
      summary: "Obtener historial académico de un alumno",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo", "Preceptor", "Alumno"],
      parameters: [
        {
          name: "studentId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Historiales encontrados",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/AcademicRecord" },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },
  "/academic-records/course/{courseId}": {
    get: {
      tags: ["Academic Records"],
      summary: "Listar historiales de un curso",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo", "Preceptor"],
      parameters: [
        {
          name: "courseId",
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
        200: { description: "Historiales encontrados" },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },
  "/academic-records/{id}": {
    get: {
      tags: ["Academic Records"],
      summary: "Obtener historial por ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Historial encontrado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AcademicRecord" },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
    patch: {
      tags: ["Academic Records"],
      summary: "Actualizar estado del ciclo y previas",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo"],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateAcademicRecordBody" },
          },
        },
      },
      responses: {
        200: { description: "Historial actualizado" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
};
