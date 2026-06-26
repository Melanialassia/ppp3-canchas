import { useState } from 'react'
import { Header } from '../../components/layout/Header'
import { DashboardTab } from './tabs/DashboardTab'
import { ReservasTab } from './tabs/ReservasTab'
import { ClientesTab } from './tabs/ClientesTab'
import { CanchasTab } from './tabs/CanchasTab'
import { ChartIcon, CalendarIcon, UsersIcon, FieldIcon } from '../../components/ui/Icons'

type Tab = 'dashboard' | 'reservas' | 'clientes' | 'canchas'

const TABS: { id: Tab; label: string; Icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: ChartIcon },
  { id: 'reservas',  label: 'Reservas',  Icon: CalendarIcon },
  { id: 'clientes',  label: 'Clientes',  Icon: UsersIcon },
  { id: 'canchas',   label: 'Canchas',   Icon: FieldIcon },
]

export function AdminPage() {
  const [tab, setTab] = useState<Tab>('dashboard')

  return (
    <>
      <Header />
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">

        <div className="md:hidden flex border-b border-slate-200 bg-white overflow-x-auto shrink-0">
          {TABS.map(({ id, label, Icon }) => {
            const active = tab === id
            return (
              <button key={id}
                className={`flex flex-1 flex-col items-center gap-1 px-4 py-3 text-[11px] font-bold uppercase tracking-wide border-none cursor-pointer font-[inherit] whitespace-nowrap min-w-[80px] transition-colors
                  ${active ? 'text-brand-700 border-b-2 border-brand-700 bg-brand-50' : 'text-slate-400 bg-transparent hover:bg-slate-50'}`}
                onClick={() => setTab(id)}
              >
                <Icon size={18} className={active ? 'text-brand-700' : 'text-slate-300'} />
                {label}
              </button>
            )
          })}
        </div>

        <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white">
          <div className="px-5 py-5 border-b border-slate-100">
            <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest">Panel Admin</p>
          </div>
          <nav className="flex flex-col gap-1 p-3 flex-1">
            {TABS.map(({ id, label, Icon }) => {
              const active = tab === id
              return (
                <button key={id}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all duration-150 text-left w-full cursor-pointer font-[inherit] border-none
                    ${active ? 'bg-brand-700 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 bg-transparent'}`}
                  onClick={() => setTab(id)}
                >
                  <Icon size={16} className={active ? 'text-white' : 'text-slate-400'} />
                  {label}
                </button>
              )
            })}
          </nav>
          <div className="p-4 border-t border-slate-100">
            <div className="bg-brand-50 rounded-xl p-3.5 border border-brand-100">
              <p className="text-[11.5px] font-bold text-brand-700 mb-0.5">FutbolReservas</p>
              <p className="text-[11px] text-brand-500/70">Panel de Administración</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 bg-slate-50 overflow-y-auto">
          <div className="p-4 sm:p-8 max-w-6xl">
            {tab === 'dashboard' && <DashboardTab />}
            {tab === 'reservas'  && <ReservasTab />}
            {tab === 'clientes'  && <ClientesTab />}
            {tab === 'canchas'   && <CanchasTab />}
          </div>
        </main>
      </div>
    </>
  )
}
