export const commonResponses = {
  InvalidCredentials: {
    description: "Credenciales inválidas (respuesta idéntica para email inexistente, contraseña incorrecta o cuenta no ACTIVE)",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        example: { success: false, message: "Invalid credentials" },
      },
    },
  },
  TooManyRequests: {
    description: "Demasiados intentos de login (10 cada 15 minutos por IP + email)",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        example: { success: false, message: "Too many login attempts, please try again later" },
      },
    },
  },
  Unauthorized: {
    description: "Token ausente, inválido, vencido o revocado (usuario inactivo / tokenVersion distinto)",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        example: { success: false, message: "No token provided" },
      },
    },
  },
  Forbidden: {
    description: "Sin permisos para esta operación",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        example: { success: false, message: "Insufficient permissions" },
      },
    },
  },
  NotFound: {
    description: "Recurso no encontrado",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        example: { success: false, message: "Resource not found" },
      },
    },
  },
  Conflict: {
    description: "El recurso ya existe",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        example: { success: false, message: "Resource already exists" },
      },
    },
  },
  ValidationError: {
    description: "Error de validación (Zod) en body, params o query",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        example: { success: false, message: "Validation failed", errors: {} },
      },
    },
  },
  BusinessRule: {
    description: "Regla de negocio incumplida",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        example: { success: false, message: "Business rule violated" },
      },
    },
  },
  EnrollmentRejected: {
    description: "Inscripción rechazada por el motor de correlatividades (todos los motivos)",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Inscripción rechazada" },
            errors: { $ref: "#/components/schemas/EnrollmentValidationResult" },
          },
        },
        example: {
          success: false,
          message: "Inscripción rechazada",
          errors: {
            allowed: false,
            reasons: [
              {
                code: "CORRELATIVE_NOT_MET",
                message: "Requiere Programación I APROBADA (estado actual: REGULARIZADA)",
                requiredStatus: "APROBADA",
                currentStatus: "REGULARIZADA",
              },
              {
                code: "CORRELATIVE_NOT_MET",
                message: "Requiere Programación II REGULARIZADA (estado actual: SIN_CURSAR)",
                requiredStatus: "REGULARIZADA",
                currentStatus: "SIN_CURSAR",
              },
            ],
          },
        },
      },
    },
  },
};
