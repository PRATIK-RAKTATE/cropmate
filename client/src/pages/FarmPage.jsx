import { useState } from 'react'
import { Button, Card, Input, Label, PageHeader, Select } from '../components/Ui.jsx'
import { useAppContext } from '../context/AppContext.jsx'
import { translations, budgets, waterLevels } from '../data/content.js'
import { api } from '../services/api.js'
import { titleCase } from '../utils/format.js'

export function FarmPage() {
  const { session, setSession, language } = useAppContext()
  const copy = translations[language]
  const [form, setForm] = useState({
    name: '',
    village: session?.defaultFarm?.location?.village || '',
    district: session?.defaultFarm?.location?.district || '',
    state: session?.defaultFarm?.location?.state || 'Maharashtra',
    lat: session?.defaultFarm?.location?.lat || 19.9975,
    lng: session?.defaultFarm?.location?.lng || 73.7898,
    farmSizeAcres: 2,
    soilType: 'black_soil',
    irrigationSource: 'well',
    waterAvailability: 'medium',
    previousCrop: 'onion',
    currentSeason: 'kharif',
    budget: 'medium',
    farmingType: 'conventional',
  })
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setSaving(true)

    try {
      const farm = await api.createFarm({
        farmerId: session.farmer._id,
        name: form.name,
        location: {
          village: form.village,
          district: form.district,
          state: form.state,
          lat: Number(form.lat),
          lng: Number(form.lng),
        },
        farmSizeAcres: Number(form.farmSizeAcres),
        soilType: form.soilType,
        irrigationSource: form.irrigationSource,
        waterAvailability: form.waterAvailability,
        previousCrop: form.previousCrop,
        currentSeason: form.currentSeason,
        budget: form.budget,
        farmingType: form.farmingType,
      })

      setSession({
        ...session,
        defaultFarm: farm,
      })
      setMessage('Farm created and set as the active farm.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow={copy.farmProfile}
        title={copy.farmPageTitle}
        description={copy.farmPageDesc}
      />

      <div className="grid gap-5 p-5 md:grid-cols-2 md:p-8">
        <Card>
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500">{copy.currentActiveFarm}</p>
          <h2 className="mt-3 text-3xl font-semibold text-stone-950">{session?.defaultFarm?.name}</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-sm text-stone-500">{copy.location}</p>
              <p className="mt-2 font-semibold text-stone-950">
                {session?.defaultFarm?.location?.village}, {session?.defaultFarm?.location?.district}
              </p>
            </div>
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-sm text-stone-500">{copy.waterAvailability}</p>
              <p className="mt-2 font-semibold text-stone-950">
                {titleCase(session?.defaultFarm?.waterAvailability)}
              </p>
            </div>
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-sm text-stone-500">{copy.soilType}</p>
              <p className="mt-2 font-semibold text-stone-950">
                {copy.soilTypes[session?.defaultFarm?.soilType] || titleCase(session?.defaultFarm?.soilType)}
              </p>
            </div>
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-sm text-stone-500">{copy.previousCrop}</p>
              <p className="mt-2 font-semibold text-stone-950">{titleCase(session?.defaultFarm?.previousCrop)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-semibold text-stone-950">{copy.createAnotherFarm}</h2>
          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            <div>
              <Label>{copy.farmName}</Label>
              <Input value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="North plot" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{copy.village}</Label>
                <Input value={form.village} onChange={(event) => updateField('village', event.target.value)} />
              </div>
              <div>
                <Label>{copy.district}</Label>
                <Input value={form.district} onChange={(event) => updateField('district', event.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{copy.latitude}</Label>
                <Input type="number" step="0.0001" value={form.lat} onChange={(event) => updateField('lat', event.target.value)} />
              </div>
              <div>
                <Label>{copy.longitude}</Label>
                <Input type="number" step="0.0001" value={form.lng} onChange={(event) => updateField('lng', event.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{copy.soilType}</Label>
                <Select value={form.soilType} onChange={(event) => updateField('soilType', event.target.value)}>
                  {Object.entries(copy.soilTypes).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>{copy.waterAvailability}</Label>
                <Select value={form.waterAvailability} onChange={(event) => updateField('waterAvailability', event.target.value)}>
                  {waterLevels.map((value) => (
                    <option key={value} value={value}>
                      {titleCase(value)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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
              <div>
                <Label>{copy.farmSize}</Label>
                <Input type="number" step="0.1" value={form.farmSizeAcres} onChange={(event) => updateField('farmSizeAcres', event.target.value)} />
              </div>
            </div>

            <Button variant="secondary" disabled={saving}>
              {saving ? copy.saving : copy.saveActiveFarm}
            </Button>
            {message ? <p className="text-sm font-semibold text-stone-700">{message}</p> : null}
          </form>
        </Card>
      </div>
    </div>
  )
}
