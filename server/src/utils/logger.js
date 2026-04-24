function formatMeta(meta = {}) {
  const entries = Object.entries(meta).filter(([, value]) => value !== undefined)

  if (entries.length === 0) {
    return ''
  }

  return ` ${JSON.stringify(Object.fromEntries(entries))}`
}

function write(level, message, meta) {
  const timestamp = new Date().toISOString()
  const line = `[${timestamp}] [${level}] ${message}${formatMeta(meta)}`

  if (level === 'ERROR') {
    console.error(line)
    return
  }

  console.log(line)
}

export const logger = {
  info(message, meta) {
    write('INFO', message, meta)
  },
  warn(message, meta) {
    write('WARN', message, meta)
  },
  error(message, meta) {
    write('ERROR', message, meta)
  },
}
