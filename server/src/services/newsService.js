import { env } from '../config/env.js'

/**
 * Service to fetch agricultural news using NewsAPI or similar.
 */
export async function getAgriNews(query = 'agriculture India') {
  try {
    if (!env.newsApiKey) {
      // Fallback news for demo
      return [
        {
          title: 'New PM-Kisan Installment Released',
          description: 'Government releases the 15th installment of PM-Kisan Samman Nidhi to over 8 crore farmers.',
          url: 'https://pib.gov.in',
          publishedAt: new Date().toISOString()
        },
        {
          title: 'MSP for Rabi Crops Increased',
          description: 'Cabinet approves hike in MSP for 6 Rabi crops for marketing season 2024-25.',
          url: 'https://pib.gov.in',
          publishedAt: new Date().toISOString()
        }
      ]
    }

    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${env.newsApiKey}&pageSize=5&sortBy=publishedAt`
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.status === 'error') throw new Error(data.message)
    
    return data.articles.map(a => ({
      title: a.title,
      description: a.description,
      url: a.url,
      publishedAt: a.publishedAt
    }))
  } catch (error) {
    console.error('News fetch failed:', error)
    return []
  }
}
