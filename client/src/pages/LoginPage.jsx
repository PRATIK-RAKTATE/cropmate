import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Ui.jsx'
import { useAppContext } from '../context/AppContext.jsx'
import { translations } from '../data/content.js'
import { districts, locations } from '../data/locations.js'
import { api } from '../services/api.js'

export function LoginPage() {
  const navigate = useNavigate()
  const { language, setSession } = useAppContext()
  const copy = translations[language]
  
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    mobile: '',
    password: '',
    name: '',
    village: locations.Maharashtra[districts[0]][0],
    district: districts[0],
    state: 'Maharashtra',
    preferredLanguage: language
  })

  function handleChange(e) {
    const { name, value } = e.target
    
    if (name === 'district') {
      const villages = locations.Maharashtra[value]
      setFormData(prev => ({ 
        ...prev, 
        district: value,
        village: villages[0] // Reset village to first one in new district
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let session
      if (isLogin) {
        session = await api.login({
          mobile: formData.mobile,
          password: formData.password
        })
      } else {
        session = await api.register(formData)
      }
      setSession(session)
      navigate('/dashboard')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  const availableVillages = locations.Maharashtra[formData.district] || []

  return (
    <div className="min-h-screen px-4 py-5 md:px-8 md:py-8 flex items-center justify-center">
      <div className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white/90 shadow-[0_24px_80px_rgba(120,113,108,0.18)] overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-stone-950 mb-2">
            {isLogin ? copy.login : copy.register}
          </h1>
          <p className="text-stone-600 mb-8">
            {isLogin ? 'Enter your credentials to access CropMate' : 'Join CropMate to get smart agriculture insights'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">{copy.name}</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                  placeholder="e.g. Ramesh Patil"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">{copy.mobileNumber}</label>
              <input
                type="tel"
                name="mobile"
                required
                pattern="[0-9]{10}"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                placeholder="10 digit mobile number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">{copy.password}</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                placeholder="At least 6 characters"
              />
            </div>

            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">{copy.district}</label>
                  <select
                    name="district"
                    required
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white appearance-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.25em' }}
                  >
                    {districts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">{copy.village}</label>
                  <select
                    name="village"
                    required
                    value={formData.village}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white appearance-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.25em' }}
                  >
                    {availableVillages.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {error && <p className="text-sm font-semibold text-red-600 mt-2">{error}</p>}

            <Button
              type="submit"
              className="w-full py-4 mt-4"
              disabled={loading}
            >
              {loading ? (isLogin ? 'Signing in...' : 'Registering...') : (isLogin ? copy.login : copy.createAccount)}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
              }}
              className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
            >
              {isLogin ? copy.noAccount : copy.alreadyHaveAccount}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
