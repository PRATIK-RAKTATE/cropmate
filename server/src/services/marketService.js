import { env } from '../config/env.js'

/**
 * Service to fetch crop market prices from external APIs (e.g., data.gov.in Agmarknet).
 */
export async function getMarketPrices(district = 'Nashik', state = 'Maharashtra') {
  try {
    const resourceId = '9ef84268-d588-465a-a308-a864a43d0070';
    
    if (env.dataGovApiKey) {
      const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${env.dataGovApiKey}&format=json&limit=10&filters[state]=${state}&filters[district]=${district}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.records && data.records.length > 0) {
        return data.records.map(r => ({
          crop: r.commodity,
          price: r.modal_price,
          unit: 'qtl',
          market: r.market,
          arrivalDate: r.arrival_date
        }));
      }
    }

    // Fallback Mock Data for demo if API fails or key is missing
    return [
      { crop: 'Onion', price: 2450, unit: 'qtl', market: `${district} Mandi`, arrivalDate: new Date().toLocaleDateString() },
      { crop: 'Tomato', price: 1800, unit: 'qtl', market: `${district} Mandi`, arrivalDate: new Date().toLocaleDateString() },
      { crop: 'Cotton', price: 7200, unit: 'qtl', market: `${district} Mandi`, arrivalDate: new Date().toLocaleDateString() },
    ]
  } catch (error) {
    console.error('Market price fetch failed:', error)
    return []
  }
}
