import type { Reserva } from '@/types'
import { Table } from './table'

export const DashboardReservationsTable = ({ reservas }: { reservas: Reserva[] }) => {
  if (!reservas?.length) {
    return (
      <div
        className="text-center py-12 text-slate-400 text-sm bg-white rounded-2xl border border-slate-200/80"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        Sin reservas para hoy
      </div>
    )
  }

  return <Table reservas={reservas} />
}
