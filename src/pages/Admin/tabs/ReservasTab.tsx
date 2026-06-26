import { useState, useRef, useEffect } from 'react'
import { useReservas } from '../../../hooks/useReservas'
import { ReservasService } from '../../../services/reservas.service'
import { PagosService, type MetodoPago } from '../../../services/pagos.service'
import { Spinner } from '../../../components/ui/Spinner'
import { BadgeReserva } from '../../../components/ui/Badge'
import { Modal } from '../../../components/ui/Modal'
import { useAlert } from '../../../components/ui/Alert'
import { DateUtils } from '../../../utils/date.utils'
import { MoneyUtils } from '../../../utils/money.utils'
import type { Reserva } from '../../../types/api'

interface AccionItem {
  label: string
  onClick: () => void
  variant?: 'default' | 'danger'
}

function DotsMenu({ acciones }: { acciones: AccionItem[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [open])

  if (acciones.length === 0) return <span />

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        aria-label="Acciones"
      >
        <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor">
          <circle cx="2" cy="2" r="1.5" />
          <circle cx="2" cy="8" r="1.5" />
          <circle cx="2" cy="14" r="1.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 min-w-[150px] bg-white rounded-lg shadow-lg border border-slate-200 py-1 overflow-hidden">
          {acciones.map(item => (
            <button
              key={item.label}
              className={`w-full text-left px-4 py-2 text-[13px] transition-colors ${
                item.variant === 'danger'
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
              onClick={() => { setOpen(false); item.onClick() }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

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
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Fecha</label>
          <input type="date" className="form-input" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Estado</label>
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
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 40 }} />
                <th>
                  <button
                    onClick={() => setOrdenFecha(v => v === 'desc' ? 'asc' : 'desc')}
                    className="flex items-center gap-1 font-semibold text-inherit hover:text-brand-700 transition-colors bg-transparent border-none cursor-pointer p-0"
                  >
                    Fecha
                    <span className="text-slate-400 text-[11px]">
                      {ordenFecha === 'desc' ? '↓' : '↑'}
                    </span>
                  </button>
                </th>
                <th>Horario inicio</th>
                <th>Horario finalización</th>
                <th>Cancha</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {reservasOrdenadas.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-slate-400">No se encontraron reservas</td></tr>
              ) : reservasOrdenadas.map(r => (
                <tr key={r.id}>
                  <td>
                    <DotsMenu acciones={getAcciones(r)} />
                  </td>
                  <td>{DateUtils.formatearFecha(r.fecha)}</td>
                  <td>{DateUtils.formatearHora(r.horaInicio)}</td>
                  <td>{DateUtils.formatearHora(r.horaFin)}</td>
                  <td>{r.canchaNombre ?? `${r.canchaId}`}</td>
                  <td>{r.clienteNombre ?? `Cliente #${r.clienteId}`}</td>
                  <td><BadgeReserva estado={r.estado} /></td>
                  <td>{MoneyUtils.formatear(r.precioTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
          <div className="form-group">
            <label className="form-label">Monto recibido</label>
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
          <div className="form-group">
            <label className="form-label">Método de pago</label>
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
