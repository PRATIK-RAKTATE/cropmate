import sharp from 'sharp'

/**
 * Clean JSON string from potential markdown wrappers
 */
function cleanJsonString(str) {
  // Remove markdown code blocks if present
  let cleaned = str.replace(/```json\n?/, '').replace(/```\n?/, '').trim()
  
  // Find the first '{' and last '}' to isolate the JSON object
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.substring(start, end + 1)
  }
  
  return cleaned
}

export async function extractSoilDataFromImage({ groqApiKey, file }) {
  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY is not configured')
  }

  if (!file) {
    throw new Error('Image file is required')
  }

  // Optimize image for vision model - slightly higher res for OCR accuracy
  console.log('Optimizing image for OCR...', file.originalname, file.size)
  const optimizedBuffer = await sharp(file.buffer)
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer()

  const base64Image = optimizedBuffer.toString('base64')
  console.log('Image optimized. Base64 length:', base64Image.length)

  const prompt = `
    You are an expert agricultural document parser. 
    Analyze the provided image of a soil test report.
    Identify the laboratory values for:
    - Nitrogen (N) 
    - Phosphorus (P) 
    - Potassium (K) 
    - pH value
    - Moisture content (%)
    - Organic Carbon (%)

    CRITICAL RULES:
    1. If the unit is not kg/ha, try to convert or use the numerical value as is.
    2. Return ONLY a valid JSON object.
    3. JSON keys MUST be exactly: "nitrogen", "phosphorus", "potassium", "ph", "moisture", "organicCarbon".
    4. Values must be NUMBERS.
    5. If a value is missing or unreadable, use these standard defaults: nitrogen: 70, phosphorus: 45, potassium: 40, ph: 6.5, moisture: 25, organicCarbon: 0.6.
    6. Do not include any explanation or markdown backticks, just the JSON.
  `

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.2-11b-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        temperature: 0, 
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Groq Vision API error:', errorData)
      throw new Error('AI Provider error')
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    
    if (!content) {
      throw new Error('Empty response from AI')
    }

    const cleanedJson = cleanJsonString(content)
    console.log('Extracted Soil JSON:', cleanedJson)
    
    return JSON.parse(cleanedJson)
  } catch (error) {
    console.error('Soil extraction failed:', error)
    throw new Error('Could not read report clearly. Please check image quality or enter manually.')
  }
}
