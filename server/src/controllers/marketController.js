import { getMarketPrices } from '../services/marketService.js'

export async function resolveMarket(request, response) {
  const { district, state } = request.body
  const marketData = await getMarketPrices(district, state)
  response.json(marketData)
}
