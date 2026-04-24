import { Farmer } from '../models/Farmer.js'

export async function listFarmers(_request, response) {
  const farmers = await Farmer.find().sort({ createdAt: 1 })
  response.json(farmers)
}

export async function getFarmer(request, response) {
  const farmer = await Farmer.findById(request.params.id)
  response.json(farmer)
}
