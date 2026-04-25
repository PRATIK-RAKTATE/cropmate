import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Card, PageHeader } from '../components/Ui.jsx'
import { useAppContext } from '../context/AppContext.jsx'
import { translations } from '../data/content.js'

export function RecommendationDetailPage() {
  const { cropName } = useParams()
  const { latestRecommendation, session, language } = useAppContext()
  const copy = translations[language]
  const recommendation = useMemo(
    () =>
      latestRecommendation?.recommendations?.find(
        (item) => item.crop.toLowerCase() === decodeURIComponent(cropName).toLowerCase(),
      ),
    [cropName, latestRecommendation],
  )

  if (!recommendation) {
    return (
      <div>
        <PageHeader
          eyebrow={copy.cropDetail}
          title={copy.recNotFound}
          description={copy.genRecFirst}
        />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow={copy.cropDetail}
        title={recommendation.crop}
        description={recommendation.reason}
      />

      <div className="grid gap-5 p-5 md:grid-cols-[0.65fr_0.35fr] md:p-8">
        <Card>
          <h2 className="text-2xl font-semibold text-stone-950">{copy.actionPlan}</h2>
          <div className="mt-6 grid gap-3">
            {recommendation.nextSteps.map((step) => (
              <div key={step} className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-700">
                {step}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-semibold text-stone-950">{copy.scoreBreakdown}</h2>
          <div className="mt-6 grid gap-3">
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-sm text-stone-500">{copy.soilSuitability}</p>
              <p className="mt-2 text-3xl font-bold text-stone-950">{recommendation.scoreBreakdown?.soil}</p>
            </div>
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-sm text-stone-500">{copy.weatherSuitability}</p>
              <p className="mt-2 text-3xl font-bold text-stone-950">{recommendation.scoreBreakdown?.weather}</p>
            </div>
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-sm text-stone-500">{copy.waterSuitability}</p>
              <p className="mt-2 text-3xl font-bold text-stone-950">{recommendation.scoreBreakdown?.water}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
