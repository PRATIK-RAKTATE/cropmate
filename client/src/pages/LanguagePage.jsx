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
    <div className="relative min-h-screen w-full overflow-x-hidden font-medium">
      {/* Cinematic Background (Absolute Whole Screen Video) */}
      <div className="fixed inset-0 z-0 h-screen w-screen overflow-hidden pointer-events-none bg-black">
        <video
          src="/13780809_3840_2160_24fps.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-1/2 left-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
        />

        {/* Subtle Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent z-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/40 z-20" />
      </div>

      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-20 md:py-8">
        <div className="flex items-center">
          <img
            src="/croplogo.png"
            alt="CropMate"
            className="h-12 w-auto md:h-14 invert brightness-200 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]"
          />
        </div>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#" className="text-sm font-semibold text-stone-300 transition-colors hover:text-white">Product</a>
          <a href="#" className="text-sm font-semibold text-stone-300 transition-colors hover:text-white">Features</a>
          <a href="#" className="text-sm font-semibold text-stone-300 transition-colors hover:text-white">Community</a>
          <div className="h-4 w-[1px] bg-white/20" />
          <button className="text-sm font-bold text-lime-400 hover:text-lime-300">Sign In</button>
        </div>
      </nav>

      {/* Main Content Layout - Asymmetrical (Right Aligned) */}
      <main className="relative z-30 flex min-h-screen items-center justify-center px-6 pt-24 pb-12 md:justify-end md:px-20 md:pt-32">
        <div className="w-full max-w-2xl md:text-left">
          <h1 className="text-5xl font-bold leading-[1.1] text-white md:text-7xl">
            {copy.heroTitle}
          </h1>

          <p className="mt-5  text-lg leading-relaxed text-stone-200/90 md:text-xl">
            {copy.heroSubtitle}
          </p>

          <div className="mt-20 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-lime-400 backdrop-blur-xl">
            <Languages className="h-4 w-4" />
            {copy.chooseLanguage}
          </div>

          {/* Integrated Language Selection */}
          <div className="mt-6">
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {Object.entries(translations).map(([code, value]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLanguage(code)}
                  className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 backdrop-blur-md ${language === code
                    ? 'border-lime-500 bg-lime-500/20 shadow-[0_15px_30px_rgba(132,204,22,0.2)]'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-[9px] font-bold uppercase tracking-[0.15em] ${language === code ? 'text-lime-400' : 'text-stone-500'}`}>
                        {code}
                      </p>
                      <p className="mt-0.5 text-lg font-bold text-white">{value.languageName}</p>
                    </div>
                    {language === code && (
                      <div className="h-2 w-2 rounded-full bg-lime-500 shadow-[0_0_10px_rgba(132,204,22,1)]" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <Button
              variant="secondary"
              className="h-14 px-10 rounded-xl bg-lime-500 text-lg font-bold text-black hover:bg-lime-400 hover:shadow-[0_0_30px_rgba(132,204,22,0.3)] active:scale-[0.98] transition-all"
              onClick={() => navigate('/login')}
            >
              {copy.continue}
              <ArrowRight className="ml-2.5 h-5 w-5" />
            </Button>

            <div className="flex gap-6">
              {[
                { icon: Sprout, label: 'Soil' },
                { icon: ShieldAlert, label: 'Risk' },
                { icon: Waves, label: 'Live' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-stone-400">
                  <item.icon className="h-3.5 w-3.5 text-lime-500/70" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-12 text-xs font-medium text-stone-500">
            © 2026 CropMate. Empowering farmers with AI.
          </p>
        </div>

        <div className="hidden flex-1 md:block" />
      </main>
    </div>
  )
}
