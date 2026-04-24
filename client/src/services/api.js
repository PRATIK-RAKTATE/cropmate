const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options)

  if (!response.ok) {
    let errorMessage = 'Request failed'

    try {
      const payload = await response.json()
      errorMessage = payload.message || errorMessage
    } catch (_error) {
      errorMessage = response.statusText || errorMessage
    }

    throw new Error(errorMessage)
  }

  return response.json()
}

export const api = {
  getFarmers() {
    return request('/farmers')
  },
  demoLogin(farmerId) {
    return request('/auth/demo-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmerId }),
    })
  },
  createFarm(payload) {
    return request('/farms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  },
  createRecommendation(payload) {
    return request('/recommendations/crop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  },
  resolveWeather(payload) {
    return request('/weather/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  },
  askAssistant(payload) {
    return request('/assistant/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  },
  getAssistantSession(farmerId, farmId) {
    return request(`/assistant/session/${farmerId}/${farmId}`)
  },
  getHistory(farmerId) {
    return request(`/history/${farmerId}`)
  },
  getRadar(farmId) {
    return request(`/radar/${farmId}`)
  },
  getAdminSummary() {
    return request('/admin/summary')
  },
  async detectDisease(formData) {
    const response = await fetch(`${API_BASE_URL}/disease/detect`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      throw new Error(payload.message || 'Disease detection failed')
    }

    return response.json()
  },
}
