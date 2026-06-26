import { ESTADOS_RESERVA, ESTADOS_CANCHA } from '../config/constants'
import type { EstadoReserva, EstadoCancha } from '../types/api'

export const EstadoUtils = {
  reserva(estado: EstadoReserva) {
    return ESTADOS_RESERVA[estado] ?? { label: estado, clase: 'badge-secondary' }
  },
  cancha(estado: EstadoCancha) {
    return ESTADOS_CANCHA[estado] ?? { label: estado, clase: 'badge-secondary' }
  },
  puedeCanselar(estado: EstadoReserva): boolean {
    return estado === 'pendiente' || estado === 'confirmada'
  },
}
