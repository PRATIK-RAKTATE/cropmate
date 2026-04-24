import { generateRadarAlert } from '../services/radarService.js'

export async function getRadarAlert(request, response) {
  const alert = await generateRadarAlert(request.params.farmId)
  response.json(alert)
}
