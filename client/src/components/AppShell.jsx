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

  const isLanding = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/admin/login'

  if (isLanding) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="flex min-h-screen flex-col overflow-hidden md:flex-row">
        <aside className="sticky top-0 h-auto md:h-screen overflow-y-auto scrollbar-hide border-b border-white/10 bg-emerald-950 px-5 py-6 text-emerald-50 md:w-80 md:border-b-0 md:border-r flex flex-col">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <Link to="/dashboard" className="flex items-center">
                <img 
                  src="/croplogo.png" 
                  alt="CropMate" 
                  className="h-14 w-auto brightness-0 invert" 
                />
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-emerald-900/40 p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-stone-400">{copy.activeFarmer}</p>
            <p className="mt-2 text-xl font-semibold">{session?.farmer?.name || 'No session'}</p>
            <p className="mt-1 text-sm text-stone-400">
              {session?.defaultFarm?.location?.village || 'Select demo profile'}
            </p>
          </div>

          <nav className="mt-6 grid gap-2">
            {navigation.map((item) => {
              // Hide admin link for non-admins
              if (item.to === '/admin' && !session?.isAdmin) return null
              
              // If admin is logged in, show only admin-related links (optional, but cleaner)
              if (session?.isAdmin && item.to !== '/admin' && item.to !== '/dashboard') return null

              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${isActive
                      ? 'bg-lime-300 text-emerald-950 shadow-lg shadow-emerald-900/20'
                      : 'text-emerald-100/70 hover:bg-emerald-900/60 hover:text-white'
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
            className="mt-6 rounded-2xl border border-emerald-800 px-4 py-3 text-sm font-semibold text-emerald-100/70 transition hover:bg-emerald-900/60 hover:text-white"
          >
            {session?.isAdmin ? copy.adminLogout : copy.switchFarmer}
          </button>
        </aside>

        <main className="flex-1 h-screen overflow-y-auto bg-[linear-gradient(180deg,rgba(251,248,241,0.75),rgba(255,255,255,0.92))]">
          {children}
        </main>
      </div>
    </div>
  )
}
