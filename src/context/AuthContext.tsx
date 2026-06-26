import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Sesion } from '../types/auth'

interface AuthContextValue {
  sesion: Sesion | null
  login: (sesion: Sesion) => void
  logout: () => void
  isAdmin: boolean
  isCliente: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function leerSesion(): Sesion | null {
  try {
    const raw = sessionStorage.getItem('sesion')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(leerSesion)

  function login(nueva: Sesion) {
    sessionStorage.setItem('sesion', JSON.stringify(nueva))
    setSesion(nueva)
  }

  function logout() {
    sessionStorage.removeItem('sesion')
    setSesion(null)
  }

  return (
    <AuthContext.Provider value={{
      sesion,
      login,
      logout,
      isAdmin: sesion?.rol === 'admin',
      isCliente: sesion?.rol === 'cliente',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
