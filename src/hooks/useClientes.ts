import { useState, useEffect } from 'react'
import type { Cliente } from '../types/api'
import { ClientesService } from '../services/clientes.service'

export function useClientes(params: Record<string, string> = {}) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const key = JSON.stringify(params)

  async function cargar() {
    setLoading(true)
    setError(null)
    try {
      const data = await ClientesService.obtenerTodos(params)
      setClientes(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [key])

  return { clientes, loading, error, recargar: cargar }
}
