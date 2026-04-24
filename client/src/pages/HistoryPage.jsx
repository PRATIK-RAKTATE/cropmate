import { useEffect, useState } from 'react'
import { Card, PageHeader } from '../components/Ui.jsx'
import { useAppContext } from '../context/AppContext.jsx'
import { api } from '../services/api.js'
import { formatDate } from '../utils/format.js'

export function HistoryPage() {
  const { session } = useAppContext()
  const [history, setHistory] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!session?.farmer?._id) {
      return
    }

    api
      .getHistory(session.farmer._id)
      .then(setHistory)
      .catch((error) => setMessage(error.message))
  }, [session])

  return (
    <div>
      <PageHeader
        eyebrow="History"
        title="Previous recommendations, scans, and chats"
        description="This page is designed for poor-connectivity scenarios where recently saved advisory needs to remain available."
      />

      <div className="grid gap-5 p-5 md:grid-cols-2 lg:grid-cols-4 md:p-8">
        <Card>
          <h2 className="text-2xl font-semibold text-stone-950">Recommendations</h2>
          <div className="mt-4 space-y-3">
            {history?.recommendations?.map((entry) => (
              <div key={entry._id} className="rounded-2xl bg-stone-50 p-4">
                <p className="font-semibold text-stone-950">{entry.recommendations?.[0]?.crop}</p>
                <p className="mt-1 text-sm text-stone-600">{formatDate(entry.createdAt)}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-semibold text-stone-950">Disease scans</h2>
          <div className="mt-4 space-y-3">
            {history?.diseases?.map((entry) => (
              <div key={entry._id} className="rounded-2xl bg-stone-50 p-4">
                <p className="font-semibold text-stone-950">{entry.disease}</p>
                <p className="mt-1 text-sm text-stone-600">
                  {entry.crop} • {formatDate(entry.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-semibold text-stone-950">Chats</h2>
          <div className="mt-4 space-y-3">
            {history?.chats?.map((entry) => (
              <div key={entry._id} className="rounded-2xl bg-stone-50 p-4">
                <p className="text-sm text-stone-600">{formatDate(entry.updatedAt)}</p>
                <p className="mt-2 text-sm text-stone-900">
                  {entry.messages?.[entry.messages.length - 1]?.content || 'No messages'}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-semibold text-stone-950">Alerts</h2>
          <div className="mt-4 space-y-3">
            {history?.alerts?.map((entry) => (
              <div key={entry._id} className="rounded-2xl bg-stone-50 p-4">
                <p className="font-semibold text-stone-950">{entry.title}</p>
                <p className="mt-1 text-sm text-stone-600">
                  {entry.category} • {formatDate(entry.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {message ? <p className="text-sm font-semibold text-red-600">{message}</p> : null}
      </div>
    </div>
  )
}
