const id = { type: "string", example: "clxxxxxxxxxxxxxxxx" };
const dateTime = { type: "string", format: "date-time" };
const roleEnum = { type: "string", enum: ["SuperAdmin", "Directivo", "Docente", "Alumno"] };
const statusEnum = { type: "string", enum: ["INVITED", "ACTIVE", "INACTIVE"] };
const scopeEnum = { type: "string", enum: ["CURSADA", "FINAL"] };
const requiredStatusEnum = { type: "string", enum: ["REGULARIZADA", "APROBADA"] };
const subjectStatusEnum = {
  type: "string",
  enum: ["SIN_CURSAR", "CURSANDO", "REGULARIZADA", "APROBADA", "DESAPROBADA"],
};
const subjectBrief = {
  type: "object",
  properties: {
    id,
    name: { type: "string", example: "Programación I" },
    yearLevel: { type: "integer", example: 1 },
  },
};

export const componentSchemas = {
  ErrorResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      message: { type: "string", example: "Error description" },
      errors: { nullable: true },
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
  LoginBody: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email", maxLength: 254, example: "alumno1@classment.demo" },
      password: { type: "string", maxLength: 72, example: "Alumno123!" },
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
          token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
          user: {
            type: "object",
            properties: {
              id,
              email: { type: "string" },
              firstName: { type: "string" },
              lastName: { type: "string" },
              role: roleEnum,
            },
          },
        },
      },
    },
  },
  RegisterBody: {
    allOf: [
      { $ref: "#/components/schemas/CreateUserBody" },
      { type: "object", required: ["password"] },
    ],
  },

  // ── Institution ─────────────────────────────────────────────────────
  Institution: {
    type: "object",
    properties: {
      id,
      name: { type: "string", example: "Instituto Superior de Formación Técnica Demo" },
      cue: { type: "string", example: "9999999-00" },
      address: { type: "string", example: "Av. Siempre Viva 742" },
      levelType: { type: "string", enum: ["TERTIARY"] },
      allowsPromotion: { type: "boolean", example: false },
      passingGrade: { type: "integer", example: 4 },
      promotionGrade: { type: "integer", nullable: true, example: null },
      validateFinalCorrelatives: { type: "boolean", example: true },
      createdAt: dateTime,
      updatedAt: dateTime,
    },
  },
  UpdateInstitutionBody: {
    type: "object",
    properties: {
      name: { type: "string" },
      cue: { type: "string" },
      address: { type: "string" },
      allowsPromotion: { type: "boolean" },
      passingGrade: { type: "integer", minimum: 1, maximum: 10 },
      promotionGrade: { type: "integer", minimum: 1, maximum: 10, nullable: true },
      validateFinalCorrelatives: { type: "boolean" },
    },
  },

  // ── User ────────────────────────────────────────────────────────────
  User: {
    type: "object",
    properties: {
      id,
      email: { type: "string", example: "alumno1@classment.demo" },
      dni: { type: "string", example: "40111222" },
      firstName: { type: "string", example: "Lucía" },
      lastName: { type: "string", example: "Fernández" },
      role: roleEnum,
      status: statusEnum,
      careers: {
        type: "array",
        items: {
          type: "object",
          properties: {
            studyPlanId: id,
            studyPlanCode: { type: "string", example: "PLAN-2026" },
            careerId: id,
            careerName: { type: "string" },
            cohortYear: { type: "integer", example: 2025 },
          },
        },
      },
      createdAt: dateTime,
    },
  },
  CreateUserBody: {
    type: "object",
    required: ["email", "dni", "firstName", "lastName", "role"],
    additionalProperties: false,
    properties: {
      email: { type: "string", format: "email", maxLength: 254 },
      dni: { type: "string", example: "40111222" },
      firstName: { type: "string", maxLength: 120 },
      lastName: { type: "string", maxLength: 120 },
      role: { type: "string", enum: ["Directivo", "Docente", "Alumno"] },
      password: { type: "string", minLength: 8, maxLength: 72, description: "Opcional: sin contraseña el usuario queda INVITED" },
      careerId: { type: "string", format: "cuid", description: "Obligatorio para Alumno" },
      cohortYear: { type: "integer", example: 2026 },
    },
  },
  UpdateUserBody: {
    type: "object",
    additionalProperties: false,
    description: "Cambiar `password` o `status` revoca todos los tokens emitidos del usuario (tokenVersion++).",
    properties: {
      email: { type: "string", format: "email", maxLength: 254 },
      dni: { type: "string" },
      firstName: { type: "string", maxLength: 120 },
      lastName: { type: "string", maxLength: 120 },
      password: { type: "string", minLength: 8, maxLength: 72 },
      status: statusEnum,
    },
  },

  // ── Career / Subject ────────────────────────────────────────────────
  Career: {
    type: "object",
    properties: {
      id,
      name: { type: "string", example: "Tecnicatura Superior en Análisis de Sistemas" },
      durationYears: { type: "integer", example: 3 },
      isActive: { type: "boolean" },
      studyPlans: {
        type: "array",
        items: {
          type: "object",
          properties: { id, code: { type: "string" }, year: { type: "integer" } },
        },
      },
      createdAt: dateTime,
      updatedAt: dateTime,
    },
  },
  CreateCareerBody: {
    type: "object",
    required: ["name", "durationYears"],
    properties: {
      name: { type: "string" },
      durationYears: { type: "integer", minimum: 1, maximum: 10, example: 3 },
    },
  },
  UpdateCareerBody: {
    type: "object",
    properties: {
      name: { type: "string" },
      durationYears: { type: "integer", minimum: 1, maximum: 10 },
      isActive: { type: "boolean" },
    },
  },
  Subject: {
    type: "object",
    properties: {
      id,
      studyPlanId: id,
      name: { type: "string", example: "Programación II" },
      yearLevel: { type: "integer", example: 2 },
      regime: { type: "string", enum: ["ANNUAL"] },
      isActive: { type: "boolean" },
      createdAt: dateTime,
      updatedAt: dateTime,
    },
  },
  CreateSubjectBody: {
    type: "object",
    required: ["careerId", "name", "yearLevel"],
    properties: {
      careerId: id,
      name: { type: "string" },
      yearLevel: { type: "integer", minimum: 1, example: 1 },
    },
  },
  UpdateSubjectBody: {
    type: "object",
    properties: {
      name: { type: "string" },
      yearLevel: { type: "integer", minimum: 1 },
      isActive: { type: "boolean" },
    },
  },
  CareerCurriculum: {
    type: "object",
    properties: {
      career: {
        type: "object",
        properties: { id, name: { type: "string" }, durationYears: { type: "integer" } },
      },
      studyPlan: {
        type: "object",
        properties: { id, code: { type: "string" }, year: { type: "integer" } },
      },
      years: {
        type: "array",
        items: {
          type: "object",
          properties: {
            yearLevel: { type: "integer" },
            subjects: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id,
                  name: { type: "string" },
                  yearLevel: { type: "integer" },
                  regime: { type: "string" },
                  isActive: { type: "boolean" },
                  correlatives: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id,
                        requiredSubjectId: id,
                        requiredSubjectName: { type: "string" },
                        appliesTo: scopeEnum,
                        requiredStatus: requiredStatusEnum,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  // ── Correlatives ────────────────────────────────────────────────────
  CorrelativeRule: {
    type: "object",
    properties: {
      id,
      subjectId: id,
      requiredSubjectId: id,
      appliesTo: scopeEnum,
      requiredStatus: requiredStatusEnum,
      subject: subjectBrief,
      requiredSubject: subjectBrief,
    },
  },
  CreateCorrelativeBody: {
    type: "object",
    required: ["subjectId", "requiredSubjectId", "appliesTo", "requiredStatus"],
    properties: {
      subjectId: { type: "string", description: "Materia que tiene el requisito" },
      requiredSubjectId: { type: "string", description: "Materia requerida" },
      appliesTo: scopeEnum,
      requiredStatus: requiredStatusEnum,
    },
  },
  SubjectCorrelatives: {
    type: "object",
    properties: {
      subject: subjectBrief,
      correlatives: { type: "array", items: { $ref: "#/components/schemas/CorrelativeRule" } },
      requiredBy: { type: "array", items: { $ref: "#/components/schemas/CorrelativeRule" } },
    },
  },

  // ── Academic records ────────────────────────────────────────────────
  StudentProgress: {
    type: "object",
    properties: {
      student: {
        type: "object",
        properties: {
          id,
          dni: { type: "string" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          email: { type: "string" },
        },
      },
      careers: {
        type: "array",
        items: {
          type: "object",
          properties: {
            careerId: id,
            careerName: { type: "string" },
            studyPlanId: id,
            cohortYear: { type: "integer" },
            summary: {
              type: "object",
              properties: {
                total: { type: "integer" },
                aprobadas: { type: "integer" },
                regularizadas: { type: "integer" },
                cursando: { type: "integer" },
                pendientes: { type: "integer" },
              },
            },
            years: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  yearLevel: { type: "integer" },
                  subjects: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        subjectId: id,
                        name: { type: "string" },
                        yearLevel: { type: "integer" },
                        status: {
                          type: "string",
                          enum: ["SIN_CURSAR", "CURSANDO", "REGULARIZADA", "APROBADA", "DESAPROBADA", "LIBRE"],
                        },
                        origin: {
                          type: "string",
                          nullable: true,
                          enum: ["CURSADA", "FINAL", "EQUIVALENCIA", "CARGA_INICIAL"],
                        },
                        finalGrade: { type: "number", nullable: true },
                        regularizedAt: { ...dateTime, nullable: true },
                        approvedAt: { ...dateTime, nullable: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  BulkUpsertRecordsBody: {
    type: "object",
    required: ["records"],
    properties: {
      records: {
        type: "array",
        items: {
          type: "object",
          required: ["subjectId", "status"],
          properties: {
            subjectId: id,
            status: {
              type: "string",
              enum: ["SIN_CURSAR", "REGULARIZADA", "APROBADA", "DESAPROBADA", "LIBRE"],
              description: "SIN_CURSAR elimina el registro",
            },
            origin: {
              type: "string",
              enum: ["EQUIVALENCIA", "CARGA_INICIAL"],
              default: "CARGA_INICIAL",
            },
            finalGrade: { type: "number", minimum: 1, maximum: 10, nullable: true },
          },
        },
      },
    },
    example: {
      records: [
        { subjectId: "clxxxxxxxxxxxxxxxx", status: "APROBADA", origin: "EQUIVALENCIA" },
        { subjectId: "clyyyyyyyyyyyyyyyy", status: "REGULARIZADA" },
      ],
    },
  },

  // ── Periods / Offerings / Enrollments ───────────────────────────────
  EnrollmentPeriod: {
    type: "object",
    properties: {
      id,
      type: scopeEnum,
      name: { type: "string", example: "Turno Diciembre — 1° Llamado" },
      academicYear: { type: "integer", example: 2026 },
      callNumber: { type: "integer", nullable: true, example: 1 },
      startsAt: dateTime,
      endsAt: dateTime,
      isActive: { type: "boolean" },
    },
  },
  CreateEnrollmentPeriodBody: {
    type: "object",
    required: ["type", "name", "academicYear", "startsAt", "endsAt"],
    properties: {
      type: scopeEnum,
      name: { type: "string" },
      academicYear: { type: "integer" },
      callNumber: { type: "integer", enum: [1, 2], nullable: true, description: "Obligatorio en FINAL, vacío en CURSADA" },
      startsAt: dateTime,
      endsAt: dateTime,
      isActive: { type: "boolean", default: true },
    },
  },
  UpdateEnrollmentPeriodBody: {
    type: "object",
    properties: {
      name: { type: "string" },
      academicYear: { type: "integer" },
      callNumber: { type: "integer", enum: [1, 2], nullable: true },
      startsAt: dateTime,
      endsAt: dateTime,
      isActive: { type: "boolean" },
    },
  },
  Offering: {
    type: "object",
    properties: {
      id,
      periodId: id,
      subjectId: id,
      teacherId: { ...id, nullable: true },
      examDate: { ...dateTime, nullable: true },
      maxCapacity: { type: "integer", nullable: true },
      period: { $ref: "#/components/schemas/EnrollmentPeriod" },
      subject: subjectBrief,
      teacher: {
        type: "object",
        nullable: true,
        properties: { id, firstName: { type: "string" }, lastName: { type: "string" } },
      },
    },
  },
  CreateOfferingBody: {
    type: "object",
    required: ["periodId", "subjectId"],
    properties: {
      periodId: id,
      subjectId: id,
      teacherId: { ...id, nullable: true },
      examDate: { ...dateTime, nullable: true, description: "Solo para períodos FINAL" },
      maxCapacity: { type: "integer", nullable: true },
    },
  },
  UpdateOfferingBody: {
    type: "object",
    properties: {
      teacherId: { ...id, nullable: true },
      examDate: { ...dateTime, nullable: true },
      maxCapacity: { type: "integer", nullable: true },
    },
  },
  RejectionReason: {
    type: "object",
    properties: {
      code: {
        type: "string",
        enum: [
          "PERIOD_CLOSED",
          "ALREADY_APPROVED",
          "ALREADY_ENROLLED",
          "ALREADY_REGULARIZED",
          "NOT_REGULARIZED_FOR_FINAL",
          "CORRELATIVE_NOT_MET",
        ],
      },
      message: { type: "string", example: "Requiere Programación I APROBADA (estado actual: REGULARIZADA)" },
      requiredSubjectId: id,
      requiredSubjectName: { type: "string" },
      requiredStatus: requiredStatusEnum,
      currentStatus: subjectStatusEnum,
    },
  },
  EnrollmentValidationResult: {
    type: "object",
    properties: {
      allowed: { type: "boolean" },
      reasons: { type: "array", items: { $ref: "#/components/schemas/RejectionReason" } },
    },
  },
  AvailableOffering: {
    type: "object",
    properties: {
      id,
      examDate: { ...dateTime, nullable: true },
      maxCapacity: { type: "integer", nullable: true },
      period: { $ref: "#/components/schemas/EnrollmentPeriod" },
      subject: subjectBrief,
      teacher: {
        type: "object",
        nullable: true,
        properties: { id, firstName: { type: "string" }, lastName: { type: "string" } },
      },
      modality: { type: "string", enum: ["REGULAR", "LIBRE"] },
      validation: { $ref: "#/components/schemas/EnrollmentValidationResult" },
      validationByModality: {
        type: "object",
        properties: {
          REGULAR: { $ref: "#/components/schemas/EnrollmentValidationResult" },
          LIBRE: { $ref: "#/components/schemas/EnrollmentValidationResult" },
        },
      },
      activeEnrollmentId: { ...id, nullable: true },
    },
  },
  CreateEnrollmentBody: {
    type: "object",
    required: ["offeringId"],
    additionalProperties: false,
    properties: {
      offeringId: id,
      modality: {
        type: "string",
        enum: ["REGULAR", "LIBRE"],
        default: "REGULAR",
        description: "LIBRE solo para mesas de final",
      },
    },
  },
  Enrollment: {
    type: "object",
    properties: {
      id,
      offeringId: id,
      studentId: id,
      modality: { type: "string", enum: ["REGULAR", "LIBRE"] },
      status: { type: "string", enum: ["ACTIVA", "BAJA", "CERRADA"] },
      grade: { type: "string", nullable: true, description: "Decimal serializado" },
      result: {
        type: "string",
        nullable: true,
        enum: ["REGULARIZADA", "APROBADA", "DESAPROBADA", "AUSENTE"],
      },
      createdAt: dateTime,
      offering: { $ref: "#/components/schemas/Offering" },
    },
  },
};
