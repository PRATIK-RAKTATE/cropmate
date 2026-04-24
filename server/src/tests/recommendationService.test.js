import { describe, expect, it } from 'vitest'
import { rankCrops } from '../services/recommendationService.js'

describe('rankCrops', () => {
  it('returns soybean as a strong recommendation for the seeded kharif farm', () => {
    const results = rankCrops({
      farm: {
        soilType: 'black_soil',
        waterAvailability: 'medium',
        previousCrop: 'onion',
      },
      soil: {
        nitrogen: 70,
        phosphorus: 45,
        potassium: 40,
        ph: 6.8,
      },
      weather: {
        current: { temperature: 28, humidity: 72 },
        forecast: { rainfallTotal: 72 },
      },
      season: 'kharif',
    })

    expect(results).toHaveLength(3)
    expect(results[0].crop).toBe('Soybean')
    expect(results[0].suitabilityScore).toBeGreaterThan(80)
  })
})
