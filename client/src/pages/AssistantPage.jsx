import { useEffect, useRef, useState } from 'react'
import { Mic, Volume2, Send, Bot, User as UserIcon } from 'lucide-react'
import { Button, Card, PageHeader } from '../components/Ui.jsx'
import { useAppContext } from '../context/AppContext.jsx'
import { api } from '../services/api.js'
import { translations } from '../data/content.js'

export function AssistantPage() {
  const { language, session } = useAppContext()
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const copy = translations[language]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (!session?.farmer || !session?.defaultFarm) return

    api
      .getAssistantSession(session.farmer._id, session.defaultFarm._id)
      .then((payload) => setMessages(payload?.messages || []))
      .catch(() => setMessages([]))
  }, [session])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function handleSubmit(event) {
    event?.preventDefault()
    if (!question.trim() || loading) return

    const userMessage = { role: 'user', content: question }
    setMessages((current) => [...current, userMessage])
    setQuestion('')
    setLoading(true)
    setError('')

    try {
      const response = await api.askAssistant({
        farmerId: session.farmer._id,
        farmId: session.defaultFarm._id,
        language,
        question,
      })

      setMessages((current) => [
        ...current,
        { role: 'assistant', content: response.answer },
      ])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleVoiceInput() {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.')
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    
    recognition.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN'
    recognition.interimResults = true
    recognition.continuous = false

    recognition.onstart = () => {
      setIsListening(true)
      setError('')
    }

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('')
      
      setQuestion(transcript)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error)
      setIsListening(false)
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please enable it in settings.')
      } else {
        setError('Voice recognition failed. Try again.')
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    try {
      recognition.start()
    } catch (err) {
      console.error('Start error', err)
      setIsListening(false)
    }
  }

  function speak(text) {
    if (!window.speechSynthesis) {
      setError('Text-to-speech is not supported in this browser.')
      return
    }
    // Cancel any ongoing speech
    window.speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN'
    
    // Adjust rate and pitch for better clarity
    utterance.rate = 0.95
    utterance.pitch = 1
    
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <div className="px-6 py-4 border-b border-stone-200 bg-white">
        <h1 className="text-xl font-bold text-stone-950 flex items-center gap-2">
          <Bot className="w-6 h-6 text-emerald-600" />
          {copy.assistantTitle}
        </h1>
        <p className="text-sm text-stone-500">{copy.assistantSubtitle}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <Bot className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-lg font-semibold text-stone-900">{copy.namasteAI}</h2>
            <p className="text-stone-600">
              {copy.aiDesc}
            </p>
          </div>
        ) : null}

        {messages.map((entry, index) => (
          <div
            key={`${entry.role}-${index}`}
            className={`flex ${entry.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${entry.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                entry.role === 'assistant' ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-600'
              }`}>
                {entry.role === 'assistant' ? <Bot className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
              </div>
              
              <div className={`relative px-5 py-4 rounded-[2rem] shadow-sm ${
                entry.role === 'assistant' 
                  ? 'bg-white border border-stone-100 text-stone-900 rounded-tl-none' 
                  : 'bg-emerald-600 text-white rounded-tr-none'
              }`}>
                <div className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed">
                  {entry.content}
                </div>
                
                {entry.role === 'assistant' && (
                  <button 
                    type="button" 
                    onClick={() => speak(entry.content)} 
                    className="absolute -right-10 top-2 p-2 text-stone-400 hover:text-emerald-600 transition-colors"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-3 items-center text-stone-500 bg-stone-50 px-5 py-3 rounded-full">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-xs font-medium uppercase tracking-wider">{copy.thinking}</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-stone-200 bg-white">
        <form 
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto flex gap-3 bg-stone-100 p-2 rounded-[2rem] border border-stone-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all"
        >
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-3 rounded-full transition-all ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                : 'text-stone-500 hover:text-emerald-600 hover:bg-white'
            }`}
            title={isListening ? "Stop listening" : "Voice input"}
          >
            <Mic className="w-5 h-5" />
          </button>
          
          <input
            className="flex-1 bg-transparent border-none focus:ring-0 px-2 py-3 text-stone-900 placeholder:text-stone-500 text-[0.9375rem]"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={copy.askSomething}
          />
          
          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="bg-emerald-600 text-white p-3 rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-all shadow-md"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
