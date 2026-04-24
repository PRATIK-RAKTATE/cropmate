import { logger } from '../utils/logger.js'

export function errorHandler(error, request, response, _next) {
  const status = error.status || 500

  logger.error('API request failed', {
    method: request.method,
    path: request.originalUrl,
    statusCode: status,
    message: error.message,
    stack: error.stack,
  })

  response.status(status).json({
    message: error.message || 'Internal server error',
    details: error.details || null,
  })
}
