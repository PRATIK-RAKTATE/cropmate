import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input, Label, PageHeader, Select } from '../components/Ui.jsx'
import { useAppContext } from '../context/AppContext.jsx'
import { budgets, seasons, soilPresets } from '../data/content.js'
import { api } from '../services/api.js'
import { titleCase } from '../utils/format.js'

export function SoilPage() {
  const navigate = useNavigate()
  const { session, setLatestRecommendation } = useAppContext()
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

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const recommendation = await api.createRecommendation({
        farmId: session.defaultFarm._id,
        season: form.season,
        budget: form.budget,
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
        eyebrow="Soil and crop"
        title="Generate top 3 crop recommendations"
        description="Use manual soil values or load a preset card. CropMate will combine soil, weather, water, profitability, and sustainability into an explainable ranking."
      />

      <div className="grid gap-5 p-5 md:grid-cols-[0.7fr_0.3fr] md:p-8">
        <Card>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Season</Label>
                <Select value={form.season} onChange={(event) => updateField('season', event.target.value)}>
                  {seasons.map((value) => (
                    <option key={value} value={value}>
                      {titleCase(value)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Budget</Label>
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
                ['nitrogen', 'Nitrogen'],
                ['phosphorus', 'Phosphorus'],
                ['potassium', 'Potassium'],
                ['ph', 'pH'],
                ['moisture', 'Moisture'],
                ['organicCarbon', 'Organic carbon'],
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
              {loading ? 'Scoring crops...' : 'Generate recommendations'}
            </Button>

            {message ? <p className="text-sm font-semibold text-red-600">{message}</p> : null}
          </form>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Sample soil cards</p>
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
