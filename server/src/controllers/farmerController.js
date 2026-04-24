import { Farmer } from '../models/Farmer.js'
import { getFarmerAlerts, markAsRead } from '../services/notificationService.js'

export async function listFarmers(_request, response) {
  const farmers = await Farmer.find().sort({ createdAt: 1 })
  response.json(farmers)
}

export async function getFarmer(request, response) {
  const farmer = await Farmer.findById(request.params.id)
  response.json(farmer)
}

export async function getAlerts(request, response) {
  const alerts = await getFarmerAlerts(request.params.farmerId)
  response.json(alerts)
}

export async function markAlertRead(request, response) {
  const alert = await markAsRead(request.params.alertId)
  response.json(alert)
}
