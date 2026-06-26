import { useState, useEffect } from 'react'
import type { Reserva } from '../types/api'
import { ReservasService } from '../services/reservas.service'

export function useReservas(params: Record<string, string> = {}) {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const key = JSON.stringify(params)

  async function cargar() {
    setLoading(true)
    setError(null)
    try {
      const data = await ReservasService.obtenerTodas(params)
      setReservas(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [key])

  return { reservas, loading, error, recargar: cargar, setReservas }
}
