import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { HomePage } from './pages/Home/HomePage'
import { LoginPage } from './pages/Login/LoginPage'
import { ReservarPage } from './pages/Reservar/ReservarPage'
import { MisReservasPage } from './pages/MisReservas/MisReservasPage'
import { AdminPage } from './pages/Admin/AdminPage'
import { NotFoundPage } from './pages/NotFound/NotFoundPage'
import { ForbiddenPage } from './pages/NotFound/ForbiddenPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/reservar"
            element={
              <ProtectedRoute requiredRole="cliente">
                <ReservarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mis-reservas"
            element={
              <ProtectedRoute requiredRole="cliente">
                <MisReservasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
