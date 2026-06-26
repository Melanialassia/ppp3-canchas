import { useState, useEffect } from 'react'
import type { Cancha } from '../types/api'
import { CanchasService } from '../services/canchas.service'

export function useCanchas() {
  const [canchas, setCanchas] = useState<Cancha[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function cargar() {
    setLoading(true)
    setError(null)
    try {
      const data = await CanchasService.obtenerTodas()
      setCanchas(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  return { canchas, loading, error, recargar: cargar, setCanchas }
}
