import { ChatSession } from '../models/ChatSession.js'

function buildSystemPrompt(language) {
  const languageMap = {
    en: 'English',
    hi: 'Hindi',
    mr: 'Marathi'
  }
  const targetLanguage = languageMap[language] || 'English'

  return `
You are CropMate, a friendly and expert multi-turn agricultural assistant. Your goal is to provide personalized crop recommendations to farmers.
Respond strictly in ${targetLanguage}. Even if the user asks in another language, you must respond in ${targetLanguage}.

CONVERSATION GUIDELINES:
1. Be empathetic, practical, and use simple "plain words" that a farmer can easily understand in ${targetLanguage}.
2. Do NOT provide a final recommendation immediately unless you have sufficient information.
3. If information is missing, ask ONE clarifying question at a time to keep the conversation simple.
4. Information you need to collect (if not already known from the farm context or previous chat):
   - Soil type (e.g., black soil, red soil, sandy soil, etc.)
   - Current season (Kharif, Rabi, Zaid)
   - Water availability and irrigation source
   - Land size
   - Previous crop grown
   - Budget or preferred crop type (cash crop, food crop, etc.)
5. Use the provided Farm and Farmer context to avoid asking questions already answered.
6. Once you have enough details, provide a clear recommendation with:
   - Suggested crops
   - Why they fit
   - Next steps
   - A friendly warning about weather or experts.
7. Always be concise.
`.trim()
}

export async function answerQuestion({
  groqApiKey,
  groqModel,
  farmer,
  farm,
  soil,
  recommendation,
  weather,
  diseaseReport,
  language,
  question,
}) {
  // Fetch existing session for history
  const existingSession = await ChatSession.findOne({ 
    farmerId: farmer._id, 
    farmId: farm._id 
  })

  const history = existingSession?.messages?.slice(-10) || [] // Keep last 10 messages for context

  const contextPrompt = `
Farmer context: ${JSON.stringify(farmer, null, 2)}
Farm context: ${JSON.stringify(farm, null, 2)}
Latest soil report: ${JSON.stringify(soil, null, 2)}
Weather info: ${JSON.stringify(weather, null, 2)}
Latest disease report: ${JSON.stringify(diseaseReport, null, 2)}
`.trim()

  let answer = "I'm sorry, I'm having trouble connecting to my brain. Please try again later."
  let fallbackUsed = true

  if (groqApiKey) {
    try {
      const messages = [
        { role: 'system', content: buildSystemPrompt(language) },
        { role: 'system', content: `Current Farm Context: ${contextPrompt}` },
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: question }
      ]

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: groqModel,
          messages,
          temperature: 0.5,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const content = data.choices?.[0]?.message?.content

        if (content) {
          answer = content
          fallbackUsed = false
        }
      }
    } catch (_error) {
      fallbackUsed = true
    }
  }

  const session = await ChatSession.findOneAndUpdate(
    { farmerId: farmer._id, farmId: farm._id },
    {
      $set: { language },
      $push: {
        messages: {
          $each: [
            { role: 'user', content: question },
            { role: 'assistant', content: answer },
          ],
        },
      },
    },
    { new: true, upsert: true },
  )

  return {
    answer,
    fallbackUsed,
    sessionId: session._id,
  }
}
