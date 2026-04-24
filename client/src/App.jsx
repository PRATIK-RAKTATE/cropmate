import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell.jsx'
import { useAppContext } from './context/AppContext.jsx'
import { AdminPage } from './pages/AdminPage.jsx'
import { AssistantPage } from './pages/AssistantPage.jsx'
import { DashboardPage } from './pages/DashboardPage.jsx'
import { DiseasePage } from './pages/DiseasePage.jsx'
import { FarmPage } from './pages/FarmPage.jsx'
import { HistoryPage } from './pages/HistoryPage.jsx'
import { LanguagePage } from './pages/LanguagePage.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { RadarPage } from './pages/RadarPage.jsx'
import { RecommendationDetailPage } from './pages/RecommendationDetailPage.jsx'
import { RecommendationsPage } from './pages/RecommendationsPage.jsx'
import { SoilPage } from './pages/SoilPage.jsx'

function ProtectedRoute({ children }) {
  const { session } = useAppContext()

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<LanguagePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farm"
          element={
            <ProtectedRoute>
              <FarmPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/soil"
          element={
            <ProtectedRoute>
              <SoilPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <RecommendationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations/:cropName"
          element={
            <ProtectedRoute>
              <RecommendationDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/disease"
          element={
            <ProtectedRoute>
              <DiseasePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assistant"
          element={
            <ProtectedRoute>
              <AssistantPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/radar"
          element={
            <ProtectedRoute>
              <RadarPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AppShell>
  )
}

export default App
