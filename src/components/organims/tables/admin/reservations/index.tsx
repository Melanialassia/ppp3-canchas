import { EmptyState } from '@/components/molecules'
import type { Reserva } from '@/types'
import { Table, type AccionItem } from './table'

export type { AccionItem }

export const AdminReservationsTable = ({
  reservas,
  loading,
  error,
  ordenFecha,
  onOrdenFecha,
  getAcciones,
}: {
  reservas: Reserva[]
  loading: boolean
  error: string
  ordenFecha: 'desc' | 'asc'
  onOrdenFecha: () => void
  getAcciones: (r: Reserva) => AccionItem[]
}) => {
  if (!loading && !error && !reservas?.length) {
    return <EmptyState titulo="No se encontraron reservas" variant="inline" />
  }

  return !loading && !!reservas?.length && (
    <Table
      reservas={reservas}
      ordenFecha={ordenFecha}
      onOrdenFecha={onOrdenFecha}
      getAcciones={getAcciones}
    />
  )
}
