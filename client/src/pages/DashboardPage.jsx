import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CloudRain, MessageCircle, Sprout, ThermometerSun, Bell } from 'lucide-react'
import { Button, Card, Metric, PageHeader } from '../components/Ui.jsx'
import { useAppContext } from '../context/AppContext.jsx'
import { api } from '../services/api.js'
import { riskTone, titleCase } from '../utils/format.js'

export function DashboardPage() {
  const { session, latestRecommendation } = useAppContext()
  const [weather, setWeather] = useState(null)
  const [market, setMarket] = useState([])
  const [history, setHistory] = useState(null)
  const [alerts, setAlerts] = useState([])
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
      api.resolveMarket({
        district: session.defaultFarm.location.district,
        state: session.defaultFarm.location.state,
      }),
      api.getHistory(session.farmer._id),
      api.getAlerts(session.farmer._id),
    ])
      .then(([weatherPayload, marketPayload, historyPayload, alertsPayload]) => {
        setWeather(weatherPayload)
        setMarket(marketPayload)
        setHistory(historyPayload)
        setAlerts(alertsPayload.filter(a => !a.isRead).slice(0, 2))
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [session])

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
            <div className="rounded-full px-3 py-2 text-xs font-semibold bg-emerald-100 text-emerald-700">
              Active Plot
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

        <Card className="bg-stone-950 text-white md:col-span-4 flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-lime-300 mb-4">Live Market Values</p>
            <div className="space-y-3">
              {market.length > 0 ? (
                market.slice(0, 4).map((m, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-white/10 pb-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{m.crop}</span>
                      <span className="text-[10px] text-stone-500 uppercase">{m.market || 'Regional'}</span>
                    </div>
                    <span className="text-sm font-bold text-lime-300">₹{m.price.toLocaleString()} / {m.unit}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-stone-400 italic py-4 text-center">Fetching latest mandi prices...</p>
              )}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-2">Latest News & Advisories</p>
            {alerts.length > 0 ? (
              <p className="text-xs font-medium leading-relaxed italic">
                "{alerts[0].title}: {alerts[0].message.substring(0, 80)}..."
              </p>
            ) : (
              <p className="text-xs font-medium leading-relaxed italic text-stone-500">
                "No recent local news for your region."
              </p>
            )}
          </div>
        </Card>

        {alerts.length > 0 && (
          <Card className="md:col-span-12 border-l-4 border-l-amber-500 bg-amber-50/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-stone-900">Recent Unread Alerts</h3>
              </div>
              <Link to="/alerts" className="text-xs font-bold text-amber-700 hover:underline">View all</Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {alerts.map(alert => (
                <div key={alert._id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[9px] font-black uppercase rounded tracking-wider">{alert.category}</span>
                    <span className="text-[10px] text-stone-400 font-bold">{new Date(alert.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="font-bold text-stone-900 text-sm truncate">{alert.title}</p>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-1">{alert.message}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

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
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[1.5rem] bg-stone-50 p-6 border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <CloudRain className="h-5 w-5 text-lime-700" />
                <h4 className="font-bold text-stone-900">Weather Insight</h4>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">
                Expect {weather?.forecast.rainfallTotal || 0}mm of cumulative rainfall this week. 
                {weather?.forecast.rainfallTotal > 50 ? ' High moisture levels detected; prioritize drainage.' : ' Ideal conditions for spraying and fertilizer application.'}
              </p>
            </div>
            
            <div className="rounded-[1.5rem] bg-stone-50 p-6 border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <ThermometerSun className="h-5 w-5 text-amber-700" />
                <h4 className="font-bold text-stone-900">Temperature Watch</h4>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">
                Daytime highs reaching {weather?.forecast.temperatureMax || '--'}°C. 
                {weather?.forecast.temperatureMax > 35 ? ' Moderate heat stress risk; irrigate in early mornings.' : ' Stable temperatures supporting healthy vegetative growth.'}
              </p>
            </div>

            <div className="rounded-[1.5rem] bg-stone-50 p-6 border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <MessageCircle className="h-5 w-5 text-sky-700" />
                <h4 className="font-bold text-stone-900">Market Trend</h4>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">
                Regional Mandi prices for {session?.defaultFarm?.previousCrop || 'major crops'} are trending upwards due to seasonal demand.
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
