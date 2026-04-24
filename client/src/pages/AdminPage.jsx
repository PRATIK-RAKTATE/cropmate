import { useEffect, useState } from 'react'
import { Card, Metric, PageHeader } from '../components/Ui.jsx'
import { api } from '../services/api.js'

export function AdminPage() {
  const [summary, setSummary] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    api
      .getAdminSummary()
      .then(setSummary)
      .catch((error) => setMessage(error.message))
  }, [])

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Operational readiness snapshot"
        description="This lightweight admin screen is enough for a hackathon demo: adoption counts plus recent recommendation activity."
      />

      <div className="grid gap-5 p-5 md:grid-cols-4 md:p-8">
        <Metric label="Farmers" value={summary?.metrics?.farmers ?? '--'} />
        <Metric label="Farms" value={summary?.metrics?.farms ?? '--'} />
        <Metric label="Recommendations" value={summary?.metrics?.recommendations ?? '--'} />
        <Metric label="Disease scans" value={summary?.metrics?.diseaseReports ?? '--'} />

        <Card className="md:col-span-4">
          <h2 className="text-2xl font-semibold text-stone-950">Recent recommendation logs</h2>
          <div className="mt-5 grid gap-3">
            {summary?.recentRecommendations?.map((entry) => (
              <div key={entry._id} className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-700">
                {entry.recommendations?.[0]?.crop} for {entry.farmId?.name || 'farm'} • {entry.weatherSource}
              </div>
            ))}
          </div>
          {message ? <p className="mt-4 text-sm font-semibold text-red-600">{message}</p> : null}
        </Card>
      </div>
    </div>
  )
}
