import { useState } from 'react'
import { useClientes } from '../../../hooks/useClientes'
import { useDebounce } from '../../../hooks/useDebounce'
import { Spinner } from '../../../components/ui/Spinner'

export function ClientesTab() {
  const [busqueda, setBusqueda] = useState('')
  const termino = useDebounce(busqueda, 500)
  const params: Record<string, string> = termino ? { busqueda: termino } : {}
  const { clientes, loading, error } = useClientes(params)

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-6">Gestión de Clientes</h1>

      <div className="mb-6 max-w-sm">
        <input
          type="text" className="form-input"
          placeholder="Buscar por nombre, teléfono o email..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {loading && <Spinner />}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Tipo</th>
                <th>Reservas</th>
                <th>Descuento</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">No se encontraron clientes</td></tr>
              ) : clientes.map(c => (
                <tr key={c.id}>
                  <td>{c.nombre} {c.apellido}</td>
                  <td>{c.telefono}</td>
                  <td>{c.email ?? '—'}</td>
                  <td>{c.tipoClienteId ?? '—'}</td>
                  <td>{c.totalReservas ?? 0}</td>
                  <td>{c.descuentoPorcentaje ?? 0}%</td>
                  <td>
                    <span className={`badge ${c.estado === 'activo' ? 'badge-success' : 'badge-danger'}`}>
                      {c.estado ?? 'activo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
