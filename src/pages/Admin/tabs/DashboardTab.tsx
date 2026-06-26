import { useEffect, useState } from 'react'
import { ReservasService } from '../../../services/reservas.service'
import { ClientesService } from '../../../services/clientes.service'
import { DateUtils } from '../../../utils/date.utils'
import { MoneyUtils } from '../../../utils/money.utils'
import { BadgeReserva } from '../../../components/ui/Badge'
import { CalendarIcon, MoneyIcon, UsersIcon, ChartIcon } from '../../../components/ui/Icons'
import type { Reserva } from '../../../types/api'

type StatConfig = {
  label: string
  value: string
  Icon: React.ComponentType<{ size?: number; className?: string }>
  color: string
  bg: string
}

export function DashboardTab() {
  const [reservasHoy, setReservasHoy] = useState<Reserva[]>([])
  const [stats, setStats] = useState<StatConfig[]>([])

  useEffect(() => {
    async function cargar() {
      const hoy = DateUtils.fechaHoy()
      const [rHoy, rTodas, clientes] = await Promise.all([
        ReservasService.obtenerTodas({ fecha: hoy }),
        ReservasService.obtenerTodas(),
        ClientesService.obtenerTodos(),
      ])
      setReservasHoy(rHoy)

      const mes = new Date().getMonth()
      const anio = new Date().getFullYear()
      const ingresos = rTodas
        .filter(r => {
          if (r.estado !== 'completada') return false
          const [y, m] = r.fecha.split('-').map(Number)
          return m - 1 === mes && y === anio
        })
        .reduce((s, r) => s + (r.precioTotal ?? 0), 0)

      const ocupacion = rHoy.length > 0 ? Math.round((rHoy.length / 10) * 100) : 0

      setStats([
        { label: 'Reservas hoy',    value: String(rHoy.length),             Icon: CalendarIcon, color: 'text-emerald-700', bg: 'bg-emerald-50 ring-emerald-200' },
        { label: 'Ingresos del mes', value: MoneyUtils.formatear(ingresos),  Icon: MoneyIcon,    color: 'text-sky-700',     bg: 'bg-sky-50 ring-sky-200' },
        { label: 'Total clientes',   value: String(clientes.length),         Icon: UsersIcon,    color: 'text-purple-700',  bg: 'bg-purple-50 ring-purple-200' },
        { label: 'Ocupación hoy',    value: `${ocupacion}%`,                 Icon: ChartIcon,    color: 'text-amber-700',   bg: 'bg-amber-50 ring-amber-200' },
      ])
    }
    cargar().catch(console.error)
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Resumen general de actividad del día</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200/80 p-5"
               style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ring-1 ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} className={color} />
              </div>
            </div>
            <div className={`text-2xl font-extrabold tracking-tight leading-none mb-1 ${color}`}>{value}</div>
            <div className="text-[12px] text-slate-400 font-medium">{label}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-slate-900">Reservas de hoy</h2>
          <span className="text-[12px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            {reservasHoy.length} total
          </span>
        </div>
        {reservasHoy.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm bg-white rounded-2xl border border-slate-200/80"
               style={{ boxShadow: 'var(--shadow-card)' }}>
            Sin reservas para hoy
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Horario</th>
                  <th>Cancha</th>
                  <th>Cliente</th>
                  <th>Estado</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {reservasHoy.map(r => (
                  <tr key={r.id}>
                    <td className="font-mono text-[13px] font-semibold text-slate-700">{r.horaInicio} – {r.horaFin}</td>
                    <td>{r.canchaNombre ?? `Cancha #${r.canchaId}`}</td>
                    <td className="font-medium">{r.clienteNombre ?? `Cliente #${r.clienteId}`}</td>
                    <td><BadgeReserva estado={r.estado} /></td>
                    <td className="font-semibold text-brand-700">{MoneyUtils.formatear(r.precioTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
