import { useEffect, useState } from 'react'
import { Card, PageHeader } from '../components/Ui.jsx'
import { useAppContext } from '../context/AppContext.jsx'
import { api } from '../services/api.js'
import { riskTone } from '../utils/format.js'

export function RadarPage() {
  const { session, latestRadar, setLatestRadar } = useAppContext()
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!session?.defaultFarm?._id) {
      return
    }

    api
      .getRadar(session.defaultFarm._id)
      .then(setLatestRadar)
      .catch((error) => setMessage(error.message))
  }, [session, setLatestRadar])

  return (
    <div>
      <PageHeader
        eyebrow="Village Risk Radar"
        title="Prevent crop loss before symptoms spread"
        description="Radar combines 7-day weather with nearby disease activity to turn the MVP from reactive advice into preventive action."
      />

      <div className="grid gap-5 p-5 md:grid-cols-[0.58fr_0.42fr] md:p-8">
        <Card className="bg-stone-950 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-lime-300">Current alert</p>
              <h2 className="mt-3 text-3xl font-semibold">{latestRadar?.title}</h2>
            </div>
            <div className={`rounded-full px-3 py-2 text-xs font-semibold ${riskTone(latestRadar?.riskLevel || 'low')}`}>
              {latestRadar?.riskLevel || 'low'}
            </div>
          </div>
          <p className="mt-6 text-sm text-stone-300">{latestRadar?.reason}</p>

          <div className="mt-6 grid gap-3">
            {latestRadar?.recommendedActions?.map((item) => (
              <div key={item} className="rounded-2xl bg-white/8 p-4 text-sm text-stone-200">
                {item}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Supporting signals</p>
          <div className="mt-5 grid gap-3">
            {latestRadar?.supportingSignals?.map((signal) => (
              <div key={signal} className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-700">
                {signal}
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl bg-lime-50 p-4 text-sm text-lime-900">
            Source: {latestRadar?.source || 'Unavailable'} • Forecast window: {latestRadar?.windowDays || 7} days
          </div>
          {message ? <p className="mt-4 text-sm font-semibold text-red-600">{message}</p> : null}
        </Card>
      </div>
    </div>
  )
}
