export const componentSchemas = {
  ErrorResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      message: { type: "string", example: "Error description" },
      errors: { type: "array", items: {}, nullable: true },
    },
  },
  SuccessResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Operation successful" },
      data: { nullable: true },
    },
  },

  // ── Auth ────────────────────────────────────────────────────────────
  RegisterBody: {
    type: "object",
    required: [
      "email",
      "password",
      "dni",
      "firstName",
      "lastName",
      "institutionId",
      "roleLevel",
    ],
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "director@school.edu.ar",
      },
      password: { type: "string", minLength: 6, example: "secret123" },
      dni: { type: "string", example: "30123456" },
      firstName: { type: "string", example: "María" },
      lastName: { type: "string", example: "García" },
      institutionId: { type: "string", example: "clxxxxxxxxxxxxxxxx" },
      roleLevel: {
        type: "string",
        enum: ["Directivo", "Preceptor", "Docente", "Alumno"],
      },
    },
  },
  LoginBody: {
    type: "object",
    required: ["email", "password", "institutionId"],
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "director@school.edu.ar",
      },
      password: { type: "string", example: "secret123" },
      institutionId: { type: "string", example: "clxxxxxxxxxxxxxxxx" },
    },
  },
  LoginResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Login successful" },
      data: {
        type: "object",
        properties: {
          token: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
        },
      },
    },
  },

  // ── User ────────────────────────────────────────────────────────────
  User: {
    type: "object",
    properties: {
      id: { type: "string", example: "clxxxxxxxxxxxxxxxx" },
      email: { type: "string", example: "user@school.edu.ar" },
      dni: { type: "string", example: "30123456" },
      firstName: { type: "string", example: "María" },
      lastName: { type: "string", example: "García" },
      isActive: { type: "boolean", example: true },
    },
  },
  UpdateUserBody: {
    type: "object",
    properties: {
      firstName: { type: "string" },
      lastName: { type: "string" },
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 6 },
    },
  },

  // ── Institution ─────────────────────────────────────────────────────
  Institution: {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string", example: "Escuela Nro. 42" },
      cue: { type: "string", example: "060123400" },
      address: { type: "string", example: "Av. Siempre Viva 742" },
      institutionType: { type: "string", enum: ["secondary", "tertiary"] },
      activeAcademicYear: { type: "integer", example: 2026 },
      gradingPeriodOpen: { type: "boolean", example: false },
      isActive: { type: "boolean", example: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  CreateInstitutionBody: {
    type: "object",
    required: [
      "name",
      "cue",
      "address",
      "institutionType",
      "activeAcademicYear",
    ],
    properties: {
      name: { type: "string", example: "Escuela Nro. 42" },
      cue: { type: "string", example: "060123400" },
      address: { type: "string", example: "Av. Siempre Viva 742" },
      institutionType: {
        type: "string",
        enum: ["secondary", "tertiary"],
        default: "secondary",
      },
      activeAcademicYear: { type: "integer", example: 2026 },
    },
  },
  UpdateInstitutionBody: {
    type: "object",
    properties: {
      name: { type: "string" },
      address: { type: "string" },
      activeAcademicYear: { type: "integer" },
      gradingPeriodOpen: { type: "boolean" },
    },
  },

  // ── Role ────────────────────────────────────────────────────────────
  Role: {
    type: "object",
    properties: {
      id: { type: "string" },
      userId: { type: "string" },
      institutionId: { type: "string" },
      level: {
        type: "string",
        enum: ["Directivo", "Preceptor", "Docente", "Alumno"],
      },
      isActive: { type: "boolean" },
      assignedCourses: { type: "array", items: { type: "object" } },
      assignedSubjects: { type: "array", items: { type: "object" } },
    },
  },
  CreateRoleBody: {
    type: "object",
    required: ["userId", "institutionId", "level"],
    properties: {
      userId: { type: "string" },
      institutionId: { type: "string" },
      level: {
        type: "string",
        enum: ["Directivo", "Preceptor", "Docente", "Alumno"],
      },
      assignedCourseIds: { type: "array", items: { type: "string" } },
      assignedSubjectIds: { type: "array", items: { type: "string" } },
    },
  },
  UpdateRoleBody: {
    type: "object",
    properties: {
      level: {
        type: "string",
        enum: ["Directivo", "Preceptor", "Docente", "Alumno"],
      },
      assignedCourseIds: { type: "array", items: { type: "string" } },
      assignedSubjectIds: { type: "array", items: { type: "string" } },
      isActive: { type: "boolean" },
    },
  },

  // ── Course ──────────────────────────────────────────────────────────
  Course: {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string", example: "1° A" },
      year: { type: "integer", example: 1 },
      division: { type: "string", example: "A" },
      academicYear: { type: "integer", example: 2026 },
      institutionId: { type: "string" },
      isActive: { type: "boolean" },
      students: { type: "array", items: { $ref: "#/components/schemas/User" } },
    },
  },
  CreateCourseBody: {
    type: "object",
    required: ["name", "year", "division", "academicYear", "institutionId"],
    properties: {
      name: { type: "string", example: "1° A" },
      year: { type: "integer", example: 1 },
      division: { type: "string", example: "A" },
      academicYear: { type: "integer", example: 2026 },
      institutionId: { type: "string" },
      studentIds: { type: "array", items: { type: "string" } },
    },
  },
  UpdateCourseBody: {
    type: "object",
    properties: {
      name: { type: "string" },
      studentIds: { type: "array", items: { type: "string" } },
      isActive: { type: "boolean" },
    },
  },

  // ── Subject ─────────────────────────────────────────────────────────
  Subject: {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string", example: "Matemática" },
      courseId: { type: "string" },
      teacherId: { type: "string" },
      institutionId: { type: "string" },
      academicYear: { type: "integer" },
      isActive: { type: "boolean" },
    },
  },
  CreateSubjectBody: {
    type: "object",
    required: [
      "name",
      "courseId",
      "teacherId",
      "institutionId",
      "academicYear",
    ],
    properties: {
      name: { type: "string", example: "Matemática" },
      courseId: { type: "string" },
      teacherId: { type: "string" },
      institutionId: { type: "string" },
      academicYear: { type: "integer", example: 2026 },
    },
  },
  UpdateSubjectBody: {
    type: "object",
    properties: {
      name: { type: "string" },
      teacherId: { type: "string" },
      isActive: { type: "boolean" },
    },
  },

  // ── AcademicRecord ──────────────────────────────────────────────────
  AcademicRecord: {
    type: "object",
    properties: {
      id: { type: "string" },
      studentId: { type: "string" },
      institutionId: { type: "string" },
      courseId: { type: "string" },
      academicYear: { type: "integer" },
      cycleStatus: {
        type: "string",
        enum: ["Promovido", "Repite", "Egresado", "EnCurso"],
      },
      previas: { type: "array", items: { type: "object" } },
    },
  },
  CreateAcademicRecordBody: {
    type: "object",
    required: ["studentId", "institutionId", "courseId", "academicYear"],
    properties: {
      studentId: { type: "string" },
      institutionId: { type: "string" },
      courseId: { type: "string" },
      academicYear: { type: "integer", example: 2026 },
    },
  },
  UpdateAcademicRecordBody: {
    type: "object",
    properties: {
      cycleStatus: {
        type: "string",
        enum: ["Promovido", "Repite", "Egresado", "EnCurso"],
      },
      previaIds: { type: "array", items: { type: "string" } },
    },
  },

  // ── Attendance ──────────────────────────────────────────────────────
  AttendanceSession: {
    type: "object",
    properties: {
      id: { type: "string" },
      courseId: { type: "string" },
      institutionId: { type: "string" },
      date: { type: "string", format: "date", example: "2026-08-24" },
      recordedById: { type: "string" },
      entries: {
        type: "array",
        items: {
          type: "object",
          properties: {
            studentId: { type: "string" },
            value: {
              type: "number",
              enum: [0, 0.5, 1],
              description: "0=Presente, 0.5=Tarde, 1=Ausente",
            },
          },
        },
      },
    },
  },
  CreateAttendanceBody: {
    type: "object",
    required: ["courseId", "institutionId", "date", "entries", "recordedById"],
    properties: {
      courseId: { type: "string" },
      institutionId: { type: "string" },
      date: { type: "string", format: "date", example: "2026-08-24" },
      recordedById: { type: "string" },
      entries: {
        type: "array",
        items: {
          type: "object",
          required: ["studentId", "value"],
          properties: {
            studentId: { type: "string" },
            value: { type: "number", enum: [0, 0.5, 1] },
          },
        },
      },
    },
  },

  // ── Grade ───────────────────────────────────────────────────────────
  Grade: {
    type: "object",
    properties: {
      id: { type: "string" },
      studentId: { type: "string" },
      subjectId: { type: "string" },
      institutionId: { type: "string" },
      academicYear: { type: "integer" },
      firstQuarterPreInforme: { type: "string" },
      firstQuarterExcludeFromReport: { type: "boolean" },
      firstQuarterFinalGrade: { type: "number", nullable: true },
      secondQuarterPreInforme: { type: "string" },
      secondQuarterExcludeFromReport: { type: "boolean" },
      secondQuarterFinalGrade: { type: "number", nullable: true },
      finalYearGrade: { type: "number", nullable: true },
    },
  },
  FindOrCreateGradeBody: {
    type: "object",
    required: ["studentId", "subjectId", "institutionId", "academicYear"],
    properties: {
      studentId: { type: "string" },
      subjectId: { type: "string" },
      institutionId: { type: "string" },
      academicYear: { type: "integer", example: 2026 },
    },
  },
  UpdateGradeBody: {
    type: "object",
    properties: {
      firstQuarterPreInforme: { type: "string" },
      firstQuarterExcludeFromReport: { type: "boolean" },
      firstQuarterFinalGrade: { type: "number", nullable: true },
      secondQuarterPreInforme: { type: "string" },
      secondQuarterExcludeFromReport: { type: "boolean" },
      secondQuarterFinalGrade: { type: "number", nullable: true },
      finalYearGrade: { type: "number", nullable: true },
    },
  },

  // ── Message ─────────────────────────────────────────────────────────
  Message: {
    type: "object",
    properties: {
      id: { type: "string" },
      title: { type: "string", example: "Reunión de padres" },
      body: { type: "string", example: "Se convoca a reunión el viernes 30." },
      senderId: { type: "string" },
      institutionId: { type: "string" },
      targetCourseId: { type: "string", nullable: true },
      createdAt: { type: "string", format: "date-time" },
    },
  },
  CreateMessageBody: {
    type: "object",
    required: ["title", "body", "senderId", "institutionId"],
    properties: {
      title: { type: "string", example: "Reunión de padres" },
      body: { type: "string", example: "Se convoca a reunión el viernes 30." },
      senderId: { type: "string" },
      institutionId: { type: "string" },
      targetCourseId: {
        type: "string",
        nullable: true,
        description: "null = broadcast global",
      },
    },
  },
};
