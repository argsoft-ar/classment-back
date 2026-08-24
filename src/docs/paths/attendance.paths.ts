export const attendancePaths = {
  "/attendance": {
    post: {
      tags: ["Attendance"],
      summary: "Registrar asistencia diaria de un curso",
      description: "Valores: 0 = Presente, 0.5 = Tarde, 1 = Ausente",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo", "Preceptor"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateAttendanceBody" },
          },
        },
      },
      responses: {
        201: {
          description: "Asistencia registrada",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AttendanceSession" },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        409: { $ref: "#/components/responses/Conflict" },
      },
    },
  },
  "/attendance/course/{courseId}": {
    get: {
      tags: ["Attendance"],
      summary: "Listar asistencias de un curso",
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
          name: "from",
          in: "query",
          required: false,
          schema: { type: "string", format: "date" },
        },
        {
          name: "to",
          in: "query",
          required: false,
          schema: { type: "string", format: "date" },
        },
      ],
      responses: {
        200: {
          description: "Asistencias encontradas",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/AttendanceSession" },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },
  "/attendance/student/{studentId}": {
    get: {
      tags: ["Attendance"],
      summary: "Ver asistencia de un alumno",
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
        200: { description: "Asistencias del alumno" },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },
  "/attendance/{id}": {
    patch: {
      tags: ["Attendance"],
      summary: "Corregir asistencia registrada",
      security: [{ bearerAuth: [] }],
      "x-roles": ["Directivo", "Preceptor"],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                entries: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      studentId: { type: "string" },
                      value: { type: "number", enum: [0, 0.5, 1] },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Asistencia actualizada" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
      },
    },
  },
};
