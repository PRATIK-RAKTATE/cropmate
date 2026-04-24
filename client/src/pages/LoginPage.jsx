import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, PageHeader } from '../components/Ui.jsx'
import { useAppContext } from '../context/AppContext.jsx'
import { translations } from '../data/content.js'
import { api } from '../services/api.js'

export function LoginPage() {
  const navigate = useNavigate()
  const { language, setSession } = useAppContext()
  const copy = translations[language]
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submittingId, setSubmittingId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .getFarmers()
      .then(setFarmers)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleLogin(farmerId) {
    try {
      setSubmittingId(farmerId)
      const session = await api.demoLogin(farmerId)
      setSession(session)
      navigate('/dashboard')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmittingId('')
    }
  }

  return (
    <div className="min-h-screen px-4 py-5 md:px-8 md:py-8">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-stone-200 bg-white/90 shadow-[0_24px_80px_rgba(120,113,108,0.18)]">
        <PageHeader
          eyebrow={copy.demoLogin}
          title="Choose a demo farmer"
          description="This MVP uses seeded farmer profiles so you can immediately test crop recommendation, assistant, history, and radar workflows."
        />

        <div className="grid gap-4 p-5 md:grid-cols-3 md:p-8">
          {loading ? <p className="text-stone-600">Loading demo farmers...</p> : null}
          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

          {farmers.map((farmer) => (
            <Card key={farmer._id} className="flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-stone-500">
                  {farmer.preferredLanguage.toUpperCase()}
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-stone-950">{farmer.name}</h2>
                <p className="mt-2 text-sm text-stone-600">
                  {farmer.village}, {farmer.district}
                </p>
                <p className="mt-1 text-sm text-stone-500">{farmer.mobile}</p>
              </div>

              <Button
                variant="secondary"
                className="mt-6"
                disabled={submittingId === farmer._id}
                onClick={() => handleLogin(farmer._id)}
              >
                {submittingId === farmer._id ? 'Signing in...' : copy.demoLogin}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
