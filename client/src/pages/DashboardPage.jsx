import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CloudRain, MessageCircle, Sprout, ThermometerSun } from 'lucide-react'
import { Button, Card, Metric, PageHeader } from '../components/Ui.jsx'
import { useAppContext } from '../context/AppContext.jsx'
import { api } from '../services/api.js'
import { riskTone, titleCase } from '../utils/format.js'

export function DashboardPage() {
  const { session, latestRecommendation, setLatestRadar, latestRadar } = useAppContext()
  const [weather, setWeather] = useState(null)
  const [history, setHistory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session?.defaultFarm) {
      return
    }

    Promise.all([
      api.resolveWeather({
        lat: session.defaultFarm.location.lat,
        lng: session.defaultFarm.location.lng,
        district: session.defaultFarm.location.district,
      }),
      api.getHistory(session.farmer._id),
      api.getRadar(session.defaultFarm._id),
    ])
      .then(([weatherPayload, historyPayload, radarPayload]) => {
        setWeather(weatherPayload)
        setHistory(historyPayload)
        setLatestRadar(radarPayload)
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [session, setLatestRadar])

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title={`Namaste, ${session?.farmer?.name?.split(' ')[0] || 'Farmer'}`}
        description="Review weather, crop recommendation readiness, local risk signals, and your latest advisory history from one screen."
        actions={
          <>
            <Link to="/soil">
              <Button variant="secondary">Generate recommendation</Button>
            </Link>
            <Link to="/assistant">
              <Button variant="primary">Ask CropMate</Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-5 p-5 md:grid-cols-12 md:p-8">
        <Card className="md:col-span-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Current farm</p>
              <h2 className="mt-2 text-3xl font-semibold text-stone-950">
                {session?.defaultFarm?.name}
              </h2>
              <p className="mt-2 text-sm text-stone-600">
                {session?.defaultFarm?.location?.village}, {session?.defaultFarm?.location?.district}
              </p>
            </div>
            <div className={`rounded-full px-3 py-2 text-xs font-semibold ${riskTone(latestRadar?.riskLevel || 'low')}`}>
              {latestRadar?.riskLevel || 'low'} risk
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <Metric
              label="Temperature"
              value={weather ? `${weather.current.temperature}°C` : '--'}
              helper="Current"
            />
            <Metric
              label="Humidity"
              value={weather ? `${weather.current.humidity}%` : '--'}
              helper="Current"
            />
            <Metric
              label="Rainfall"
              value={weather ? `${weather.forecast.rainfallTotal} mm` : '--'}
              helper="Next 7 days"
            />
            <Metric
              label="Water"
              value={titleCase(session?.defaultFarm?.waterAvailability || '') || '--'}
              helper="Farm availability"
            />
          </div>

          {weather?.fallbackUsed ? (
            <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Live weather was unavailable, so the app used seeded fallback weather for this district.
            </p>
          ) : null}
        </Card>

        <Card className="bg-stone-950 text-white md:col-span-4">
          <p className="text-xs uppercase tracking-[0.22em] text-lime-300">Village Risk Radar</p>
          <h2 className="mt-3 text-2xl font-semibold">
            {latestRadar?.title || 'Risk signal will appear after radar loads'}
          </h2>
          <p className="mt-3 text-sm text-stone-300">
            {latestRadar?.reason ||
              'Radar combines nearby disease activity and forecasted weather to raise preventive alerts.'}
          </p>
          <Link to="/radar" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-lime-300">
            Open full radar
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>

        <Card className="md:col-span-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-lime-100 p-3 text-lime-700">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Top crop</p>
              <h3 className="text-xl font-semibold text-stone-950">
                {latestRecommendation?.recommendations?.[0]?.crop || history?.recommendations?.[0]?.recommendations?.[0]?.crop || 'Generate recommendation'}
              </h3>
            </div>
          </div>
          <p className="mt-4 text-sm text-stone-600">
            {latestRecommendation?.recommendations?.[0]?.reason ||
              history?.recommendations?.[0]?.recommendations?.[0]?.reason ||
              'Run the soil and weather flow to generate top 3 crops.'}
          </p>
          <Link to="/recommendations" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-stone-950">
            View recommendation
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>

        <Card className="md:col-span-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Disease scans</p>
              <h3 className="text-xl font-semibold text-stone-950">{history?.diseases?.length ?? '--'}</h3>
            </div>
          </div>
          <p className="mt-4 text-sm text-stone-600">
            Upload a leaf image to get probable disease, severity, and treatment guidance.
          </p>
          <Link to="/disease" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-stone-950">
            Open scan flow
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>

        <Card className="md:col-span-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Assistant</p>
              <h3 className="text-xl font-semibold text-stone-950">Farm-aware Q&A</h3>
            </div>
          </div>
          <p className="mt-4 text-sm text-stone-600">
            Ask follow-up questions with soil, weather, recommendation, and disease context included automatically.
          </p>
          <Link to="/assistant" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-stone-950">
            Ask CropMate
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>

        <Card className="md:col-span-12">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] bg-stone-50 p-4">
              <CloudRain className="h-5 w-5 text-lime-700" />
              <p className="mt-4 text-sm font-semibold text-stone-950">Preventive decisions</p>
              <p className="mt-2 text-sm text-stone-600">
                Radar surfaces what to do before disease visibly spreads.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-stone-50 p-4">
              <ThermometerSun className="h-5 w-5 text-amber-700" />
              <p className="mt-4 text-sm font-semibold text-stone-950">Weather fallback</p>
              <p className="mt-2 text-sm text-stone-600">
                Open-Meteo is used live, with district seed data as a demo-safe backup.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-stone-50 p-4">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="mt-4 text-sm font-semibold text-stone-950">External AI guardrails</p>
              <p className="mt-2 text-sm text-stone-600">
                Disease analysis requires `PLANT_ID_API_KEY`. If missing, the app returns a controlled provider error instead of guessing.
              </p>
            </div>
          </div>

          {loading ? <p className="mt-5 text-sm text-stone-500">Loading dashboard...</p> : null}
          {error ? <p className="mt-5 text-sm font-semibold text-red-600">{error}</p> : null}
        </Card>
      </div>
    </div>
  )
}
