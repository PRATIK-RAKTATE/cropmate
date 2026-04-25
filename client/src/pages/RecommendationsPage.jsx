import { Link } from 'react-router-dom'
import { ArrowRight, Droplets, Leaf, Timer } from 'lucide-react'
import { Button, Card, PageHeader } from '../components/Ui.jsx'
import { useAppContext } from '../context/AppContext.jsx'
import { translations } from '../data/content.js'
import { riskTone } from '../utils/format.js'

export function RecommendationsPage() {
  const { latestRecommendation, session, language } = useAppContext()
  const copy = translations[language]
  const recommendations = latestRecommendation?.recommendations || []

  return (
    <div>
      <PageHeader
        eyebrow={copy.history}
        title={copy.recTitle}
        description={copy.recDesc}
        actions={
          <Link to="/soil">
            <Button variant="secondary">{copy.reRunScoring}</Button>
          </Link>
        }
      />

      <div className="grid gap-5 p-5 md:grid-cols-3 md:p-8">
        {recommendations.length === 0 ? (
          <Card className="md:col-span-3">
            <p className="text-lg font-semibold text-stone-950">{copy.noRecYet}</p>
            <p className="mt-2 text-sm text-stone-600">
              {copy.startFromSoil}
            </p>
          </Card>
        ) : null}

        {recommendations.map((crop) => (
          <Card key={crop.crop} className="flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-stone-500">{copy.recommendedCrop}</p>
                  <h2 className="mt-2 text-3xl font-semibold text-stone-950">{crop.crop}</h2>
                </div>
                <div className={`rounded-full px-3 py-2 text-xs font-semibold ${riskTone(crop.riskLevel)}`}>
                  {crop.riskLevel} {copy.risk}
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-sm text-stone-500">{copy.suitability}</p>
                  <p className="mt-2 text-3xl font-bold text-stone-950">{crop.suitabilityScore}%</p>
                </div>
                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-sm text-stone-500">{copy.profitability}</p>
                  <p className="mt-2 text-3xl font-bold text-stone-950">{crop.profitabilityScore}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-stone-600">
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2">
                  <Timer className="h-4 w-4" />
                  {crop.durationDays} {copy.days}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-2">
                  <Droplets className="h-4 w-4" />
                  {crop.waterNeed} {copy.waterNeed}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-lime-50 px-3 py-2">
                  <Leaf className="h-4 w-4" />
                  {crop.sustainabilityScore} {copy.sustainability}
                </span>
              </div>

              <p className="mt-5 text-sm text-stone-600">{crop.reason}</p>
            </div>

            <Link to={`/recommendations/${encodeURIComponent(crop.crop)}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-stone-950">
              {copy.viewPlan}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}
