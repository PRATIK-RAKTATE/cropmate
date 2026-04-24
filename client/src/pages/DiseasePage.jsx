import { useState } from 'react'
import { Button, Card, Input, Label, PageHeader, Select } from '../components/Ui.jsx'
import { useAppContext } from '../context/AppContext.jsx'
import { api } from '../services/api.js'
import { riskTone } from '../utils/format.js'

export function DiseasePage() {
  const { session } = useAppContext()
  const [crop, setCrop] = useState('tomato')
  const [image, setImage] = useState(null)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('farmerId', session.farmer._id)
      formData.append('farmId', session.defaultFarm._id)
      formData.append('crop', crop)
      formData.append('image', image)

      const result = await api.detectDisease(formData)
      setReport(result)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Disease scan"
        title="Upload a crop image"
        description="Leaf analysis uses a hosted vision API. If the provider is not configured, CropMate returns a controlled setup error instead of guessing."
      />

      <div className="grid gap-5 p-5 md:grid-cols-[0.48fr_0.52fr] md:p-8">
        <Card>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div>
              <Label>Crop</Label>
              <Select value={crop} onChange={(event) => setCrop(event.target.value)}>
                <option value="tomato">Tomato</option>
                <option value="potato">Potato</option>
                <option value="chili">Chili</option>
                <option value="soybean">Soybean</option>
              </Select>
            </div>
            <div>
              <Label>Leaf image</Label>
              <Input type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] || null)} />
            </div>

            <Button variant="secondary" disabled={loading || !image}>
              {loading ? 'Analyzing leaf...' : 'Detect disease'}
            </Button>
            {message ? <p className="text-sm font-semibold text-red-600">{message}</p> : null}
          </form>
        </Card>

        <Card>
          {report ? (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Detected issue</p>
                  <h2 className="mt-2 text-3xl font-semibold text-stone-950">{report.disease}</h2>
                </div>
                <div className={`rounded-full px-3 py-2 text-xs font-semibold ${riskTone(report.severity)}`}>
                  {report.severity}
                </div>
              </div>
              <p className="mt-4 text-sm text-stone-600">
                Confidence {report.confidence}% • Provider {report.provider}
              </p>
              <p className="mt-4 rounded-2xl bg-stone-50 p-4 text-sm text-stone-700">{report.cause}</p>

              <div className="mt-5 grid gap-3">
                {[
                  ['Immediate action', report.immediateAction],
                  ['Organic treatment', report.organicTreatment],
                  ['Chemical treatment', report.chemicalTreatment],
                  ['Prevention tips', report.preventionTips],
                ].map(([label, items]) => (
                  <div key={label} className="rounded-2xl bg-stone-50 p-4">
                    <p className="font-semibold text-stone-950">{label}</p>
                    <ul className="mt-3 list-disc pl-5 text-sm text-stone-700">
                      {items?.length ? items.map((item) => <li key={item}>{item}</li>) : <li>No extra guidance.</li>}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-stone-600">
              Upload a leaf image to see disease name, confidence, severity, treatments, and prevention.
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}
