import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Card, PageHeader } from '../components/Ui.jsx'
import { useAppContext } from '../context/AppContext.jsx'

export function RecommendationDetailPage() {
  const { cropName } = useParams()
  const { latestRecommendation } = useAppContext()
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
          eyebrow="Crop detail"
          title="Recommendation not found"
          description="Generate recommendations first, then open a crop card for the full action plan."
        />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Crop detail"
        title={recommendation.crop}
        description={recommendation.reason}
      />

      <div className="grid gap-5 p-5 md:grid-cols-[0.65fr_0.35fr] md:p-8">
        <Card>
          <h2 className="text-2xl font-semibold text-stone-950">Action plan</h2>
          <div className="mt-6 grid gap-3">
            {recommendation.nextSteps.map((step) => (
              <div key={step} className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-700">
                {step}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-semibold text-stone-950">Score breakdown</h2>
          <div className="mt-6 grid gap-3">
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-sm text-stone-500">Soil suitability</p>
              <p className="mt-2 text-3xl font-bold text-stone-950">{recommendation.scoreBreakdown?.soil}</p>
            </div>
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-sm text-stone-500">Weather suitability</p>
              <p className="mt-2 text-3xl font-bold text-stone-950">{recommendation.scoreBreakdown?.weather}</p>
            </div>
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-sm text-stone-500">Water suitability</p>
              <p className="mt-2 text-3xl font-bold text-stone-950">{recommendation.scoreBreakdown?.water}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
