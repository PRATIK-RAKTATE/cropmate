import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input, Label, PageHeader, Select } from '../components/Ui.jsx'
import { useAppContext } from '../context/AppContext.jsx'
import { translations, budgets, seasons, soilPresets } from '../data/content.js'
import { api } from '../services/api.js'
import { titleCase } from '../utils/format.js'
import { Camera, Upload, Loader2 } from 'lucide-react'

export function SoilPage() {
  const navigate = useNavigate()
  const { session, setLatestRecommendation, language } = useAppContext()
  const fileInputRef = useRef(null)
  const copy = translations[language]
  const [form, setForm] = useState({
    season: session?.defaultFarm?.currentSeason || 'kharif',
    budget: session?.defaultFarm?.budget || 'medium',
    nitrogen: 70,
    phosphorus: 45,
    potassium: 40,
    ph: 6.8,
    moisture: 34,
    organicCarbon: 0.7,
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)

  async function handleScanReport(event) {
    const file = event.target.files?.[0]
    if (!file) return

    setScanning(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('image', file)

      const extractedData = await api.extractSoilData(formData)
      setForm(prev => ({
        ...prev,
        ...extractedData
      }))
    } catch (error) {
      setMessage(copy.scanError || error.message)
    } finally {
      setScanning(false)
    }
  }

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const recommendation = await api.createRecommendation({
        farmerId: session.farmer._id,
        farmId: session.defaultFarm._id,
        season: form.season,
        budget: form.budget,
        language,
        soil: {
          nitrogen: Number(form.nitrogen),
          phosphorus: Number(form.phosphorus),
          potassium: Number(form.potassium),
          ph: Number(form.ph),
          moisture: Number(form.moisture),
          organicCarbon: Number(form.organicCarbon),
          source: 'manual_input',
        },
      })

      setLatestRecommendation(recommendation)
      navigate('/recommendations')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow={copy.soilAndCrop}
        title={copy.soilPageTitle}
        description={copy.soilPageDesc}
      />

      <div className="grid gap-5 p-5 md:grid-cols-[0.7fr_0.3fr] md:p-8">
        <Card>
          <div className="mb-6 flex flex-wrap gap-3">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleScanReport}
            />
            <button
              type="button"
              disabled={scanning}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2.5 rounded-2xl border-2 border-dashed border-stone-200 bg-white px-6 py-4 font-bold text-stone-600 transition-all hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-50"
            >
              {scanning ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {copy.scanning}
                </>
              ) : (
                <>
                  <Camera className="h-5 w-5" />
                  {copy.scanReport}
                </>
              )}
            </button>
            
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-stone-50 border border-stone-100 text-[10px] font-black uppercase tracking-wider text-stone-400">
              <Upload className="w-3.5 h-3.5" />
              {copy.soilPresets || 'Presets'}
            </div>
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{copy.season}</Label>
                <Select value={form.season} onChange={(event) => updateField('season', event.target.value)}>
                  {seasons.map((value) => (
                    <option key={value} value={value}>
                      {titleCase(value)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>{copy.budget}</Label>
                <Select value={form.budget} onChange={(event) => updateField('budget', event.target.value)}>
                  {budgets.map((value) => (
                    <option key={value} value={value}>
                      {titleCase(value)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['nitrogen', copy.nitrogen],
                ['phosphorus', copy.phosphorus],
                ['potassium', copy.potassium],
                ['ph', copy.ph],
                ['moisture', copy.moisture],
                ['organicCarbon', copy.organicCarbon],
              ].map(([key, label]) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={form[key]}
                    onChange={(event) => updateField(key, event.target.value)}
                  />
                </div>
              ))}
            </div>

            <Button variant="secondary" disabled={loading}>
              {loading ? copy.scoringCrops : copy.generateRec}
            </Button>

            {message ? <p className="text-sm font-semibold text-red-600">{message}</p> : null}
          </form>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500">{copy.sampleSoilCards}</p>
          <div className="mt-4 grid gap-3">
            {soilPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setForm((current) => ({ ...current, ...preset.values }))}
                className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4 text-left transition hover:border-lime-400 hover:bg-lime-50"
              >
                <p className="font-semibold text-stone-950">{preset.label}</p>
                <p className="mt-2 text-sm text-stone-600">
                  NPK {preset.values.nitrogen}/{preset.values.phosphorus}/{preset.values.potassium}, pH {preset.values.ph}
                </p>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
