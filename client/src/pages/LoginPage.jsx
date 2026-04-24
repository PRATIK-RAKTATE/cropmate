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

  // Safety check for translations
  const copy = translations[language] || translations.en

  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Safety check for initial location data
  const defaultDistrict = districts[0] || ''
  const defaultVillage = (defaultDistrict && locations.Maharashtra[defaultDistrict])
    ? locations.Maharashtra[defaultDistrict][0]
    : ''

  const [formData, setFormData] = useState({
    mobile: '',
    password: '',
    name: '',
    village: defaultVillage,
    district: defaultDistrict,
    state: 'Maharashtra',
    preferredLanguage: language || 'en'
  })

  function handleChange(e) {
    const { name, value } = e.target

    if (name === 'district') {
      const villages = locations.Maharashtra[value] || []
      setFormData(prev => ({
        ...prev,
        district: value,
        village: villages[0] || ''
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
      setError(requestError.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const availableVillages = locations.Maharashtra[formData.district] || []

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden font-medium bg-stone-950">
      {/* Background Image - Adjusted Visibility */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/farm-bg-nature.png" 
          alt="Background" 
          className="h-full w-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/50" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 px-4 py-8">
        <div className="rounded-[2.5rem] border border-white/40 bg-white/15 backdrop-blur-[2px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="p-8">
            <div className="flex justify-center mb-8">
              <img 
                src="/croplogo.png" 
                alt="CropMate" 
                className="h-16 w-auto brightness-0 invert" 
              />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isLogin ? copy.login : copy.register}
            </h1>
            <p className="text-stone-300 mb-8">
              {isLogin ? 'Enter your credentials to access CropMate' : 'Join CropMate to get smart agriculture insights'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-1">{copy.name}</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-lime-500/30 focus:border-lime-500 transition-all bg-white/10 text-white placeholder-black"
                    placeholder="e.g. Ramesh Patil"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">{copy.mobileNumber}</label>
                <input
                  type="tel"
                  name="mobile"
                  required
                  pattern="[0-9]{10}"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-lime-500/30 focus:border-lime-500 transition-all bg-white/10 text-white placeholder-black"
                  placeholder="10 digit mobile number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">{copy.password}</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-lime-500/30 focus:border-lime-500 transition-all bg-white/10 text-white placeholder-black"
                  placeholder="At least 6 characters"
                />
              </div>

              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-1">{copy.district}</label>
                    <select
                      name="district"
                      required
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-lime-500/30 focus:border-lime-500 transition-all bg-white/10 text-white appearance-none"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23a8a29e\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.25em' }}
                    >
                      {districts.map(d => (
                        <option key={d} value={d} className="bg-stone-900 text-white">{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-1">{copy.village}</label>
                    <select
                      name="village"
                      required
                      value={formData.village}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-lime-500/30 focus:border-lime-500 transition-all bg-white/10 text-white appearance-none"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23a8a29e\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.25em' }}
                    >
                      {availableVillages.map(v => (
                        <option key={v} value={v} className="bg-stone-900 text-white">{v}</option>
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
    </div>
  )
}
