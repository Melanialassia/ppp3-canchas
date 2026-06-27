import api from './api'
import type { MetodoPago, TipoPago } from '@/types'

export type { MetodoPago, TipoPago }

export const PagosService = {
  async registrar(
    reservaId: number,
    monto: number,
    metodoPago: MetodoPago,
    tipoPago: TipoPago = 'seña',
  ) {
    const { data } = await api.post('/pagos', {
      reservaId,
      monto,
      tipoPago,
      metodoPago,
    })
    return data.data ?? data
  },

  async obtenerPorReserva(reservaId: number) {
    const { data } = await api.get('/pagos', { params: { reservaId } })
    return data
  },
}
