import { useNavigate } from 'react-router-dom'
import { ArrowRight, Languages, ShieldAlert, Sprout, Waves } from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'
import { translations } from '../data/content.js'
import { Button } from '../components/Ui.jsx'

export function LanguagePage() {
  const navigate = useNavigate()
  const { language, setLanguage } = useAppContext()
  const copy = translations[language]

  return (
    <div className="min-h-screen px-4 py-5 md:px-8 md:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-stone-200 bg-white/85 shadow-[0_24px_80px_rgba(120,113,108,0.18)] backdrop-blur md:grid-cols-[1.2fr_0.8fr]">
        <section className="relative overflow-hidden bg-stone-950 px-6 py-8 text-white md:px-10 md:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(163,230,53,0.2),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.18),transparent_38%)]" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.28em] text-lime-300">
              <Languages className="h-4 w-4" />
              {copy.chooseLanguage}
            </div>
            <h1 className="mt-8 max-w-xl font-['Fraunces'] text-5xl leading-tight md:text-7xl">
              {copy.heroTitle}
            </h1>
            <p className="mt-6 max-w-xl text-base text-stone-300 md:text-lg">
              {copy.heroSubtitle}
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: Sprout,
                  title: 'Explainable recommendations',
                  text: 'Soil, weather, water, and crop rotation scored in one view.',
                },
                {
                  icon: ShieldAlert,
                  title: 'Village Risk Radar',
                  text: 'A preventive alert layer driven by humidity, rain, and nearby scans.',
                },
                {
                  icon: Waves,
                  title: 'Multimodal advisory',
                  text: 'Chat, voice, and disease-image workflows in one dashboard.',
                },
              ].map((item) => {
                const Icon = item.icon

                return (
                  <div key={item.title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <Icon className="h-5 w-5 text-lime-300" />
                    <h2 className="mt-4 text-lg font-semibold">{item.title}</h2>
                    <p className="mt-2 text-sm text-stone-300">{item.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="px-6 py-8 md:px-10 md:py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-stone-500">
            CropMate MVP
          </p>
          <h2 className="mt-6 font-['Fraunces'] text-4xl text-stone-950">Start in the right language.</h2>

          <div className="mt-10 grid gap-4">
            {Object.entries(translations).map(([code, value]) => (
              <button
                key={code}
                type="button"
                onClick={() => setLanguage(code)}
                className={`rounded-[1.75rem] border p-5 text-left transition ${
                  language === code
                    ? 'border-lime-500 bg-lime-50 shadow-[0_12px_30px_rgba(132,204,22,0.15)]'
                    : 'border-stone-200 bg-stone-50 hover:border-stone-300 hover:bg-white'
                }`}
              >
                <p className="text-xs uppercase tracking-[0.22em] text-stone-500">{code}</p>
                <p className="mt-2 text-2xl font-semibold text-stone-950">{value.languageName}</p>
                <p className="mt-2 text-sm text-stone-600">{value.heroSubtitle}</p>
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            className="mt-8 inline-flex items-center gap-2"
            onClick={() => navigate('/login')}
          >
            {copy.continue}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </section>
      </div>
    </div>
  )
}
