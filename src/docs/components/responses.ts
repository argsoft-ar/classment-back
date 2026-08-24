export const commonResponses = {
  Unauthorized: {
    description: "Token ausente o inválido",
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
    description: "Error de validación en el body",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        example: { success: false, message: "Validation error", errors: [] },
      },
    },
  },
};
