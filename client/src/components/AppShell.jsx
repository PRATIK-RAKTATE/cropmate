import { Link, NavLink, useLocation } from 'react-router-dom'
import { CloudSun, History, LayoutDashboard, Leaf, MessageCircle, ShieldAlert, Sprout, UserRound, Waves, Bell } from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'
import { translations } from '../data/content.js'

const navigation = [
  { to: '/dashboard', label: 'dashboard', icon: LayoutDashboard },
  { to: '/farm', label: 'farmProfile', icon: UserRound },
  { to: '/soil', label: 'soilAndCrop', icon: Sprout },
  { to: '/disease', label: 'diseaseScan', icon: Leaf },
  { to: '/assistant', label: 'assistant', icon: MessageCircle },
  { to: '/history', label: 'history', icon: History },
  { to: '/alerts', label: 'alerts', icon: Bell },
  { to: '/admin', label: 'admin', icon: Waves },
]

export function AppShell({ children }) {
  const { language, session, logout } = useAppContext()
  const copy = translations[language]
  const location = useLocation()

  const isLanding = location.pathname === '/' || location.pathname === '/login'

  if (isLanding) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-stone-200/70 bg-white/80 shadow-[0_25px_80px_rgba(107,80,27,0.12)] backdrop-blur md:flex-row">
        <aside className="border-b border-stone-200/80 bg-stone-950 px-5 py-6 text-stone-100 md:w-80 md:border-b-0 md:border-r">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <Link to="/dashboard" className="inline-flex items-center gap-3">
                <div className="rounded-2xl bg-lime-300 p-3 text-stone-950">
                  <CloudSun className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-['Fraunces'] text-2xl leading-none">CropMate</p>
                  <p className="mt-1 text-sm text-stone-400">Village-first crop advisory</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-stone-800 bg-stone-900/90 p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Active farmer</p>
            <p className="mt-2 text-xl font-semibold">{session?.farmer?.name || 'No session'}</p>
            <p className="mt-1 text-sm text-stone-400">
              {session?.defaultFarm?.location?.village || 'Select demo profile'}
            </p>
          </div>

          <nav className="mt-6 grid gap-2">
            {navigation.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-lime-300 text-stone-950'
                        : 'text-stone-200 hover:bg-stone-900 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {copy[item.label]}
                </NavLink>
              )
            })}
          </nav>

          <button
            type="button"
            onClick={logout}
            className="mt-6 rounded-2xl border border-stone-700 px-4 py-3 text-sm font-semibold text-stone-200 transition hover:bg-stone-900"
          >
            Switch farmer
          </button>
        </aside>

        <main className="flex-1 bg-[linear-gradient(180deg,rgba(251,248,241,0.75),rgba(255,255,255,0.92))]">
          {children}
        </main>
      </div>
    </div>
  )
}
