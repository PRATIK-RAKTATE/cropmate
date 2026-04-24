import { logger } from '../utils/logger.js'

export function requestLogger(request, response, next) {
  const startedAt = Date.now()

  response.on('finish', () => {
    logger.info('API request completed', {
      method: request.method,
      path: request.originalUrl,
      statusCode: response.statusCode,
      durationMs: Date.now() - startedAt,
      ip: request.ip,
    })
  })

  next()
}
