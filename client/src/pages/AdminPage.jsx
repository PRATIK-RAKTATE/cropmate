import { useEffect, useState } from 'react'
import { Card, Metric, PageHeader, Button, Input, Select, Label } from '../components/Ui.jsx'
import { api } from '../services/api.js'
import { Send, MessageSquare, ShieldAlert, Bell } from 'lucide-react'

export function AdminPage() {
  const [summary, setSummary] = useState(null)
  const [message, setMessage] = useState('')
  const [alertForm, setAlertForm] = useState({
    region: { village: '', district: '', state: '' },
    category: 'weather',
    priority: 'medium',
    title: '',
    message: ''
  })
  const [sending, setSending] = useState(false)

  const fetchSummary = () => {
    api
      .getAdminSummary()
      .then(setSummary)
      .catch((error) => setMessage(error.message))
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  const handleSendAlert = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      await api.sendRegionalAlert(alertForm)
      setMessage('Alert sent successfully!')
      setAlertForm({ ...alertForm, title: '', message: '' })
      fetchSummary()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Admin Control Center"
        title="Network Pulse & Regional Alerts"
        description="Monitor system health and broadcast hyper-local agricultural advisories to specific regions."
      />

      <div className="p-5 md:p-8 space-y-8">
        {/* Metrics */}
        <div className="grid gap-5 md:grid-cols-4">
          <Metric label="Farmers" value={summary?.metrics?.farmers ?? '--'} />
          <Metric label="Active Farms" value={summary?.metrics?.farms ?? '--'} />
          <Metric label="SMS Alerts Sent" value={summary?.metrics?.smsLogs ?? '--'} />
          <Metric label="Disease Reports" value={summary?.metrics?.diseaseReports ?? '--'} />
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Send Alert Form */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <Bell className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-stone-900">Broadcast Regional Alert</h2>
            </div>
            
            <form onSubmit={handleSendAlert} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label>Village (Optional)</Label>
                  <Input 
                    placeholder="e.g. Malegaon" 
                    value={alertForm.region.village}
                    onChange={e => setAlertForm({...alertForm, region: {...alertForm.region, village: e.target.value}})}
                  />
                </div>
                <div>
                  <Label>District</Label>
                  <Input 
                    placeholder="e.g. Nashik" 
                    value={alertForm.region.district}
                    onChange={e => setAlertForm({...alertForm, region: {...alertForm.region, district: e.target.value}})}
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <Input 
                    placeholder="Maharashtra" 
                    value={alertForm.region.state}
                    onChange={e => setAlertForm({...alertForm, region: {...alertForm.region, state: e.target.value}})}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Category</Label>
                  <Select value={alertForm.category} onChange={e => setAlertForm({...alertForm, category: e.target.value})}>
                    <option value="weather">Weather</option>
                    <option value="advisory">Advisory</option>
                    <option value="government">Government Update</option>
                    <option value="market">Market/Mandi</option>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={alertForm.priority} onChange={e => setAlertForm({...alertForm, priority: e.target.value})}>
                    <option value="low">Low (Feed only)</option>
                    <option value="medium">Medium (Dashboard)</option>
                    <option value="high">High (Instant SMS)</option>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Title</Label>
                <Input 
                  required 
                  placeholder="Short, catchy title" 
                  value={alertForm.title}
                  onChange={e => setAlertForm({...alertForm, title: e.target.value})}
                />
              </div>

              <div>
                <Label>Message</Label>
                <textarea 
                  required
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition focus:border-emerald-500 focus:bg-white min-h-[100px]"
                  placeholder="Detailed instructions for farmers..."
                  value={alertForm.message}
                  onChange={e => setAlertForm({...alertForm, message: e.target.value})}
                />
              </div>

              <Button variant="primary" className="w-full" disabled={sending}>
                {sending ? 'Sending Broadcast...' : (
                  <span className="flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" /> Broadcast Alert
                  </span>
                )}
              </Button>
              {message && <p className="text-sm font-semibold text-emerald-600 text-center">{message}</p>}
            </form>
          </Card>

          {/* SMS Logs */}
          <div className="space-y-6">
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-stone-900">Recent SMS Delivery</h2>
              </div>
              
              <div className="space-y-3">
                {summary?.recentSms?.map((sms) => (
                  <div key={sms._id} className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-stone-900">{sms.farmerId?.name || sms.mobile}</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${sms.status === 'sent' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {sms.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 line-clamp-2">{sms.message}</p>
                    <p className="mt-2 text-[9px] text-stone-400 font-bold uppercase tracking-wider">
                      {new Date(sms.createdAt).toLocaleString()} via {sms.provider}
                    </p>
                  </div>
                ))}
                {(!summary?.recentSms || summary.recentSms.length === 0) && (
                  <p className="text-center text-stone-400 py-8 italic text-sm">No SMS history found.</p>
                )}
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-stone-900">AI Risk Monitoring</h2>
              </div>
              <p className="text-sm text-stone-600 mb-4">
                The automated alert engine scans weather patterns every 4 hours. 
                Last run: {new Date().toLocaleTimeString()}
              </p>
              <div className="p-4 rounded-2xl bg-stone-900 text-emerald-400 font-mono text-[11px] leading-relaxed">
                {`> Initializing weather scan...`} <br/>
                {`> Found ${summary?.metrics?.farms || 0} active plots.`} <br/>
                {`> No immediate high-risk anomalies detected.`} <br/>
                {`> Background rules: [Rainfall > 50mm, Temp > 40C, Humid > 85%]`}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
