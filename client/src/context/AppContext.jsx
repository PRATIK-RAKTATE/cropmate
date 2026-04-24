import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'cropmate-app-state'

const AppContext = createContext(null)

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return {
        language: 'en',
        session: null,
        latestRecommendation: null,
      }
    }

    return JSON.parse(raw)
  } catch (_error) {
    return {
      language: 'en',
      session: null,
      latestRecommendation: null,
    }
  }
}

export function AppProvider({ children }) {
  const [state, setState] = useState(loadInitialState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const value = {
    language: state.language,
    session: state.session,
    latestRecommendation: state.latestRecommendation,
    setLanguage(language) {
      setState((current) => ({ ...current, language }))
    },
    setSession(session) {
      setState((current) => ({ ...current, session }))
    },
    setLatestRecommendation(latestRecommendation) {
      setState((current) => ({ ...current, latestRecommendation }))
    },
    logout() {
      setState({
        language: state.language,
        session: null,
        latestRecommendation: null,
      })
    },
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }

  return context
}
