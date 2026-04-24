export function titleCase(value) {
  if (!value) {
    return ''
  }

  return value
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function riskTone(level) {
  if (level === 'high') {
    return 'bg-red-100 text-red-700 ring-1 ring-red-300'
  }

  if (level === 'medium') {
    return 'bg-amber-100 text-amber-800 ring-1 ring-amber-300'
  }

  return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300'
}
