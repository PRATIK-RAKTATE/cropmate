import { useEffect, useState } from 'react'
import { Bell, Check, Info, AlertTriangle, CloudRain, ShieldAlert } from 'lucide-react'
import { Card, PageHeader } from '../components/Ui.jsx'
import { useAppContext } from '../context/AppContext.jsx'
import { api } from '../services/api.js'
import { translations } from '../data/content.js'

export function AlertsPage() {
  const { session, language } = useAppContext()
  const copy = translations[language]
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.farmer?._id) return
    api.getAlerts(session.farmer._id).then(setAlerts).finally(() => setLoading(false))
  }, [session])

  const handleMarkRead = async (alertId) => {
    await api.markAlertRead(alertId)
    setAlerts(alerts.map(a => a._id === alertId ? { ...a, isRead: true } : a))
  }

  const getIcon = (category) => {
    switch (category) {
      case 'weather': return <CloudRain className="w-5 h-5 text-blue-500" />
      case 'advisory': return <ShieldAlert className="w-5 h-5 text-emerald-500" />
      case 'government': return <Info className="w-5 h-5 text-amber-500" />
      default: return <Bell className="w-5 h-5 text-stone-500" />
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow={copy.alerts}
        title={copy.alertsTitle}
        description={copy.alertsDesc}
      />

      <div className="p-5 md:p-8 space-y-4">
        {loading ? (
          <p className="text-stone-500">{copy.loadingAlerts}</p>
        ) : alerts.length === 0 ? (
          <Card className="text-center py-12">
            <Bell className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500 font-medium">{copy.noAlertsYet}</p>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card 
              key={alert._id} 
              className={`transition-all ${alert.isRead ? 'opacity-70 bg-stone-50/50' : 'border-l-4 border-l-emerald-500 shadow-md'}`}
            >
              <div className="flex gap-5 items-start">
                <div className="p-3 rounded-2xl bg-white shadow-sm border border-stone-100 flex-shrink-0">
                  {getIcon(alert.category)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-stone-950">{alert.title}</h3>
                      {alert.priority === 'high' && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-black uppercase rounded tracking-wider">{copy.highPriority}</span>
                      )}
                    </div>
                    <span className="text-xs text-stone-400 font-semibold">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-stone-600 text-sm leading-relaxed mb-4">{alert.message}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-stone-100 rounded-full text-[10px] font-bold uppercase text-stone-500 tracking-wider">
                        {alert.category}
                      </span>
                      {alert.sentSms && (
                        <span className="px-3 py-1 bg-blue-50 rounded-full text-[10px] font-bold uppercase text-blue-500 tracking-wider">
                          {copy.smsSent}
                        </span>
                      )}
                    </div>
                    
                    {!alert.isRead && (
                      <button 
                        onClick={() => handleMarkRead(alert._id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        {copy.markAsRead}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
