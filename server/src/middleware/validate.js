import { createHttpError } from '../utils/httpError.js'

export function validate(schema, payload) {
  const result = schema.safeParse(payload)

  if (!result.success) {
    throw createHttpError(400, 'Validation failed', result.error.flatten())
  }

  return result.data
}
