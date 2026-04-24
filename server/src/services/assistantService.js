import { ChatSession } from '../models/ChatSession.js'

function buildFallbackAnswer({ question, language, recommendation, weather, diseaseReport }) {
  const crop = recommendation?.recommendations?.[0]?.crop || 'the suggested crop'
  const diseaseLine = diseaseReport
    ? `Latest disease signal: ${diseaseReport.disease} on ${diseaseReport.crop}.`
    : 'No recent disease scan is attached to this answer.'

  const answers = {
    en: `Direct answer: ${crop} is currently the strongest fit for this farm.\nWhy this applies: Weather is around ${weather.current.temperature}C with ${weather.current.humidity}% humidity, and the latest recommendation already ranks ${crop} highest. ${diseaseLine}\nNext steps: Review the crop detail screen, follow the listed next actions, and re-check the radar alert before sowing.\nWarning: If your field conditions have changed since the last soil entry, update the soil report before acting.\nQuestion received: ${question}`,
    hi: `सीधा उत्तर: इस खेत के लिए अभी ${crop} सबसे मजबूत विकल्प है।\nयह सलाह क्यों लागू है: मौसम लगभग ${weather.current.temperature}C है और आर्द्रता ${weather.current.humidity}% है। हाल की सिफारिश में ${crop} सबसे ऊपर है। ${diseaseLine}\nअगले कदम: फसल विवरण स्क्रीन देखें, दिए गए अगले कदम अपनाएं, और बुवाई से पहले रडार अलर्ट फिर जांचें।\nचेतावनी: यदि मिट्टी की स्थिति बदली है तो कार्रवाई से पहले नया सॉइल एंट्री करें।\nप्रश्न: ${question}`,
    mr: `थेट उत्तर: या शेतासाठी सध्या ${crop} हा सर्वात मजबूत पर्याय आहे.\nही सल्ला तुमच्या शेताला का लागू आहे: तापमान सुमारे ${weather.current.temperature}C आणि आर्द्रता ${weather.current.humidity}% आहे. अलीकडच्या शिफारशीत ${crop} वरच्या क्रमांकावर आहे. ${diseaseLine}\nपुढील पावले: पीक तपशील स्क्रीन उघडा, दिलेली पावले घ्या, आणि पेरणीपूर्वी रडार अलर्ट पुन्हा तपासा.\nइशारा: मातीची स्थिती बदलली असेल तर कृतीपूर्वी नवीन सॉइल एंट्री द्या.\nप्रश्न: ${question}`,
  }

  return answers[language] || answers.en
}

function buildPrompt({ farmer, farm, soil, recommendation, weather, diseaseReport, language, question }) {
  return `
You are CropMate, a farmer advisory assistant.
Respond in ${language}.
Use exactly four labeled sections:
1. Direct Answer
2. Why this applies to your farm
3. Next steps
4. Warning or when to contact an expert

Farmer:
${JSON.stringify(farmer, null, 2)}

Farm:
${JSON.stringify(farm, null, 2)}

Latest soil report:
${JSON.stringify(soil, null, 2)}

Latest recommendation:
${JSON.stringify(recommendation, null, 2)}

Weather:
${JSON.stringify(weather, null, 2)}

Latest disease report:
${JSON.stringify(diseaseReport, null, 2)}

Farmer question:
${question}
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
  const fallback = buildFallbackAnswer({
    question,
    language,
    recommendation,
    weather,
    diseaseReport,
  })

  let answer = fallback
  let fallbackUsed = true

  if (groqApiKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: groqModel,
          messages: [
            {
              role: 'system',
              content:
                'You are a careful agricultural assistant. Do not give unsafe chemical dosage. Be concise and practical.',
            },
            {
              role: 'user',
              content: buildPrompt({
                farmer,
                farm,
                soil,
                recommendation,
                weather,
                diseaseReport,
                language,
                question,
              }),
            },
          ],
          temperature: 0.3,
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
