import { useState } from 'react'
import { useReservas } from '@/hooks'
import { ReservasService, PagosService } from '@/services'
import type { MetodoPago, Reserva } from '@/types'
import { Spinner, Modal, useAlert } from '@/components'
import { MoneyUtils } from '@/utils'
import { AdminReservationsTable, type AccionItem } from '@/components/organims/tables'

interface ConfirmModal {
  id: number
  estado: string
  titulo: string
  mensaje: string
}

export function ReservasTab() {
  const { mostrar, AlertComponent } = useAlert()
  const [filtroFecha, setFiltroFecha] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const params: Record<string, string> = {}
  if (filtroFecha) params.fecha = filtroFecha
  if (filtroEstado) params.estado = filtroEstado
  const { reservas, loading, error, recargar } = useReservas(params)

  const [modalPago, setModalPago] = useState<Reserva | null>(null)
  const [montoPago, setMontoPago] = useState('')
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [procesando, setProcesando] = useState(false)

  const [confirmModal, setConfirmModal] = useState<ConfirmModal | null>(null)
  const [ejecutando, setEjecutando] = useState(false)

  const [ordenFecha, setOrdenFecha] = useState<'desc' | 'asc'>('desc')
  const reservasOrdenadas = [...reservas].sort((a, b) =>
    ordenFecha === 'desc'
      ? b.fecha.localeCompare(a.fecha)
      : a.fecha.localeCompare(b.fecha)
  )

  async function accion(id: number, estado: string) {
    setEjecutando(true)
    try {
      await ReservasService.actualizarEstado(id, estado)
      mostrar('Estado actualizado', 'success')
      recargar()
    } catch (err) {
      mostrar((err as Error).message, 'error')
    } finally {
      setEjecutando(false)
      setConfirmModal(null)
    }
  }

  async function confirmarPago() {
    if (!modalPago || !montoPago) return
    setProcesando(true)
    try {
      await PagosService.registrar(modalPago.id, parseFloat(montoPago), metodoPago as MetodoPago)
      mostrar('Pago registrado. La reserva se confirma al cubrir la seña.', 'success')
      setModalPago(null)
      recargar()
    } catch (err) {
      mostrar((err as Error).message, 'error')
    } finally {
      setProcesando(false)
    }
  }

  function getAcciones(r: Reserva): AccionItem[] {
    const items: AccionItem[] = []

    if (r.estado === 'pendiente') {
      items.push({
        label: 'Confirmar',
        onClick: () => { setModalPago(r); setMontoPago(String(r.senaRequerida ?? '')) },
      })
      items.push({
        label: 'Cancelar',
        variant: 'danger',
        onClick: () => setConfirmModal({
          id: r.id,
          estado: 'cancelada',
          titulo: 'Cancelar reserva',
          mensaje: `¿Querés cancelar la reserva #${r.id}? Esta acción no se puede deshacer.`,
        }),
      })
    }

    if (r.estado === 'confirmada') {
      items.push({
        label: 'Completar',
        onClick: () => setConfirmModal({
          id: r.id,
          estado: 'completada',
          titulo: 'Completar reserva',
          mensaje: `¿Querés marcar la reserva #${r.id} como completada?`,
        }),
      })
      items.push({
        label: 'Cancelar',
        variant: 'danger',
        onClick: () => setConfirmModal({
          id: r.id,
          estado: 'cancelada',
          titulo: 'Cancelar reserva',
          mensaje: `¿Querés cancelar la reserva #${r.id}? Esta acción no se puede deshacer.`,
        }),
      })
      items.push({
        label: 'No Mostrar',
        variant: 'danger',
        onClick: () => setConfirmModal({
          id: r.id,
          estado: 'no_show',
          titulo: 'Marcar como No Show',
          mensaje: `¿Querés marcar la reserva #${r.id} como No Show?`,
        }),
      })
    }

    return items
  }

  return (
    <div>
      {AlertComponent}
      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-6">Gestión de Reservas</h1>

      <div className="flex gap-4 mb-6 flex-wrap">
        <div style={{ margin: 0 }}>
          <label className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">Fecha</label>
          <input type="date" className="form-input" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} />
        </div>
        <div style={{ margin: 0 }}>
          <label className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">Estado</label>
          <select className="form-select" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
            <option value="no_show">No Show</option>
          </select>
        </div>
      </div>

      {loading && <Spinner />}
      {error && (
        <div className="px-4 py-3.5 rounded-xl flex items-start gap-3 text-[13.5px] border bg-red-50 text-red-800 border-red-200">
          {error}
        </div>
      )}

      <AdminReservationsTable
        reservas={reservasOrdenadas}
        loading={loading}
        error={error}
        ordenFecha={ordenFecha}
        onOrdenFecha={() => setOrdenFecha(v => v === 'desc' ? 'asc' : 'desc')}
        getAcciones={getAcciones}
      />

      {confirmModal && (
        <Modal
          titulo={confirmModal.titulo}
          onClose={() => setConfirmModal(null)}
          footer={
            <div className="flex gap-2 justify-end">
              <button className="btn btn-outline" onClick={() => setConfirmModal(null)} disabled={ejecutando}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={() => accion(confirmModal.id, confirmModal.estado)}
                disabled={ejecutando}
              >
                {ejecutando ? '...' : 'Aceptar'}
              </button>
            </div>
          }
        >
          <p className="text-slate-600">{confirmModal.mensaje}</p>
        </Modal>
      )}

      {modalPago && (
        <Modal
          titulo="Confirmar Reserva"
          onClose={() => setModalPago(null)}
          footer={
            <div className="flex gap-2 justify-end">
              <button className="btn btn-outline" onClick={() => setModalPago(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={confirmarPago} disabled={procesando}>
                {procesando ? '...' : 'Confirmar Pago'}
              </button>
            </div>
          }
        >
          <div className="mb-5">
            <label className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">Monto recibido</label>
            <div className="flex gap-2 flex-wrap mb-2">
              <button
                type="button" className="btn btn-small btn-outline"
                onClick={() => setMontoPago(String(modalPago.senaRequerida ?? 0))}
              >
                Seña: {MoneyUtils.formatear(modalPago.senaRequerida ?? 0)}
              </button>
              <button
                type="button" className="btn btn-small btn-outline"
                onClick={() => setMontoPago(String(modalPago.precioTotal))}
              >
                Total: {MoneyUtils.formatear(modalPago.precioTotal)}
              </button>
            </div>
            <input
              type="number" className="form-input" min={0}
              value={montoPago} onChange={e => setMontoPago(e.target.value)}
            />
          </div>
          <div className="mb-5">
            <label className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">Método de pago</label>
            <select className="form-select" value={metodoPago} onChange={e => setMetodoPago(e.target.value)}>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>
        </Modal>
      )}
    </div>
  )
}
