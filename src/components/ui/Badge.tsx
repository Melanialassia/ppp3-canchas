import { EstadoUtils } from '../../utils/estado.utils'
import type { EstadoReserva, EstadoCancha } from '../../types/api'

export function BadgeReserva({ estado }: { estado: EstadoReserva }) {
  const { label, clase } = EstadoUtils.reserva(estado)
  return <span className={`badge ${clase}`}>{label}</span>
}

export function BadgeCancha({ estado }: { estado: EstadoCancha }) {
  const { label, clase } = EstadoUtils.cancha(estado)
  return <span className={`badge ${clase}`}>{label}</span>
}
