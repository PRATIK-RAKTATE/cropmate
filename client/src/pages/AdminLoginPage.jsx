import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Ui.jsx'
import { useAppContext } from '../context/AppContext.jsx'
import { api } from '../services/api.js'
import { ShieldCheck } from 'lucide-react'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const { setSession } = useAppContext()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    mobile: '',
    password: ''
  })

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.adminLogin(formData)
      // We store admin session separately or just use the same but check for isAdmin
      setSession({
        farmer: response.admin,
        isAdmin: true
      })
      navigate('/admin')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-lime-400 text-stone-950 mb-6">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-['Fraunces'] text-white font-bold">Admin Portal</h1>
          <p className="text-stone-400 mt-2">Authorized access only</p>
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Admin Mobile</label>
              <input
                type="tel"
                name="mobile"
                required
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-4 py-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 transition-all"
                placeholder="Enter mobile number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 transition-all"
                placeholder="Enter password"
              />
            </div>

            {error && (
              <p className="text-sm font-semibold text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full py-5 rounded-xl bg-stone-950 hover:bg-stone-800 text-lime-400 font-bold"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In to Admin'}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <button 
              onClick={() => navigate('/')}
              className="text-sm text-stone-500 hover:text-stone-950 transition-colors"
            >
              Return to Website
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
