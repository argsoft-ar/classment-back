// Shared building blocks for OpenAPI path definitions.

export const bearer = [{ bearerAuth: [] }];

export const pathParam = (name: string, description?: string) => ({
  name,
  in: "path",
  required: true,
  schema: { type: "string" },
  ...(description && { description }),
});

export const queryParam = (
  name: string,
  schema: Record<string, unknown>,
  description?: string,
  required = false,
) => ({
  name,
  in: "query",
  required,
  schema,
  ...(description && { description }),
});

export const jsonBody = (ref: string) => ({
  required: true,
  content: {
    "application/json": { schema: { $ref: `#/components/schemas/${ref}` } },
  },
});

/** Success envelope `{ success, message, data }` wrapping the given schema. */
export const ok = (description: string, ref?: string, isArray = false) => {
  const data = ref
    ? isArray
      ? { type: "array", items: { $ref: `#/components/schemas/${ref}` } }
      : { $ref: `#/components/schemas/${ref}` }
    : { nullable: true };
  return {
    description,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "OK" },
            data,
          },
        },
      },
    },
  };
};

export const err = (name: string) => ({ $ref: `#/components/responses/${name}` });

export const authErrors = {
  401: err("Unauthorized"),
  403: err("Forbidden"),
};
