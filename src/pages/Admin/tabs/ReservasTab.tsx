import { useState } from 'react'
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

  async function accion(id: number, estado: string) {
    if (!confirm(`¿Confirmar acción "${estado}" para reserva #${id}?`)) return
    try {
      await ReservasService.actualizarEstado(id, estado)
      mostrar('Estado actualizado', 'success')
      recargar()
    } catch (err) {
      mostrar((err as Error).message, 'error')
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
                <th>#</th>
                <th>Fecha</th>
                <th>Horario</th>
                <th>Cancha</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservas.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-slate-400">No se encontraron reservas</td></tr>
              ) : reservas.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{DateUtils.formatearFecha(r.fecha)}</td>
                  <td>{r.horaInicio} - {r.horaFin}</td>
                  <td>{r.canchaNombre ?? `Cancha #${r.canchaId}`}</td>
                  <td>{r.clienteNombre ?? `Cliente #${r.clienteId}`}</td>
                  <td><BadgeReserva estado={r.estado} /></td>
                  <td>{MoneyUtils.formatear(r.precioTotal)}</td>
                  <td>
                    <div className="flex gap-1.5 flex-wrap">
                      {r.estado === 'pendiente' && (
                        <button
                          className="btn btn-small btn-primary"
                          onClick={() => { setModalPago(r); setMontoPago(String(r.senaRequerida ?? '')); }}
                        >
                          Confirmar
                        </button>
                      )}
                      {r.estado === 'confirmada' && (
                        <button className="btn btn-small btn-success" onClick={() => accion(r.id, 'completada')}>
                          Completar
                        </button>
                      )}
                      {(r.estado === 'confirmada' || r.estado === 'pendiente') && (
                        <button className="btn btn-small btn-danger" onClick={() => accion(r.id, 'cancelada')}>
                          Cancelar
                        </button>
                      )}
                      {r.estado === 'confirmada' && (
                        <button className="btn btn-small btn-outline" onClick={() => accion(r.id, 'no_show')}>
                          No Show
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
