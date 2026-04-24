import { useEffect, useRef, useState } from 'react'
import { Mic, Volume2 } from 'lucide-react'
import { Button, Card, PageHeader, Textarea } from '../components/Ui.jsx'
import { useAppContext } from '../context/AppContext.jsx'
import { api } from '../services/api.js'

export function AssistantPage() {
  const { language, session } = useAppContext()
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (!session?.farmer || !session?.defaultFarm) {
      return
    }

    api
      .getAssistantSession(session.farmer._id, session.defaultFarm._id)
      .then((payload) => setMessages(payload?.messages || []))
      .catch(() => setMessages([]))
  }, [session])

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await api.askAssistant({
        farmerId: session.farmer._id,
        farmId: session.defaultFarm._id,
        language,
        question,
      })

      setMessages((current) => [
        ...current,
        { role: 'user', content: question },
        { role: 'assistant', content: response.answer },
      ])
      setQuestion('')
      if (response.fallbackUsed) {
        setMessage('Groq was unavailable or not configured, so CropMate used a farm-aware fallback answer.')
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  function handleVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setMessage('Speech recognition is not supported in this browser.')
      return
    }

    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN'
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript
      if (transcript) {
        setQuestion(transcript)
      }
    }
    recognitionRef.current.start()
  }

  function speak(text) {
    if (!window.speechSynthesis) {
      setMessage('Text-to-speech is not supported in this browser.')
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN'
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div>
      <PageHeader
        eyebrow="AI assistant"
        title="Ask with farm context already included"
        description="Questions automatically include the active farm, latest soil report, weather summary, crop recommendation, and latest disease report."
      />

      <div className="grid gap-5 p-5 md:grid-cols-[0.42fr_0.58fr] md:p-8">
        <Card>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <Textarea
              rows="8"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Which crop is safest in medium water this season?"
            />

            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" disabled={loading || !question.trim()}>
                {loading ? 'Asking...' : 'Ask CropMate'}
              </Button>
              <Button type="button" variant="subtle" onClick={handleVoiceInput} className="inline-flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Voice input
              </Button>
            </div>

            {message ? <p className="text-sm font-semibold text-stone-700">{message}</p> : null}
          </form>
        </Card>

        <Card>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <p className="text-sm text-stone-600">
                Ask a question to see a structured answer with direct advice, why it applies, next steps, and warnings.
              </p>
            ) : null}

            {messages.map((entry, index) => (
              <div
                key={`${entry.role}-${index}`}
                className={`rounded-[1.5rem] p-4 ${
                  entry.role === 'assistant'
                    ? 'bg-stone-950 text-white'
                    : 'bg-stone-100 text-stone-900'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-xs uppercase tracking-[0.22em] opacity-70">{entry.role}</p>
                  {entry.role === 'assistant' ? (
                    <button type="button" onClick={() => speak(entry.content)} className="opacity-70 transition hover:opacity-100">
                      <Volume2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
                <pre className="mt-3 whitespace-pre-wrap text-sm leading-6">{entry.content}</pre>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
