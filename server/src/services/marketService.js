import { env } from '../config/env.js'

/**
 * Service to fetch crop market prices from external APIs (e.g., data.gov.in Agmarknet).
 */
export async function getMarketPrices(district = 'Nashik', state = 'Maharashtra') {
  try {
    // If we had a real API key for data.gov.in:
    // const resourceId = '9ef273e5-7f29-414d-adc9-adac2f86af7d'; // Agmarknet resource ID
    // const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${env.dataGovApiKey}&format=json&filters[state]=${state}&filters[district]=${district}`;
    // const response = await fetch(url);
    // const data = await response.json();
    // return data.records;

    // For Hackathon Demo: Return curated mock data if API key is missing
    // In a real scenario, this would be a real fetch.
    return [
      { crop: 'Onion', price: 2450, unit: 'qtl', market: `${district} Mandi`, arrivalDate: new Date().toLocaleDateString() },
      { crop: 'Tomato', price: 1800, unit: 'qtl', market: `${district} Mandi`, arrivalDate: new Date().toLocaleDateString() },
      { crop: 'Cotton', price: 7200, unit: 'qtl', market: `${district} Mandi`, arrivalDate: new Date().toLocaleDateString() },
      { crop: 'Soybean', price: 4600, unit: 'qtl', market: `${district} Mandi`, arrivalDate: new Date().toLocaleDateString() },
      { crop: 'Wheat', price: 2125, unit: 'qtl', market: `${district} Mandi`, arrivalDate: new Date().toLocaleDateString() },
    ]
  } catch (error) {
    console.error('Market price fetch failed:', error)
    return []
  }
}
