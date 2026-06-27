import { useEffect, useState } from "react";
import { ReservasService, ClientesService } from "@/services";
import { DateUtils, MoneyUtils } from "@/utils";
import {
  LuCalendar,
  LuDollarSign,
  LuUsers,
  LuChartBarIncreasing,
} from "react-icons/lu";
import { DashboardReservationsTable } from "@/components/organims/tables";
import type { Reserva } from "@/types";

type StatConfig = {
  label: string;
  value: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bg: string;
};

export function DashboardTab() {
  const [reservasHoy, setReservasHoy] = useState<Reserva[]>([]);
  const [stats, setStats] = useState<StatConfig[]>([]);

  useEffect(() => {
    async function cargar() {
      const hoy = DateUtils.fechaHoy();
      const [rHoy, rTodas, clientes] = await Promise.all([
        ReservasService.obtenerTodas({ fecha: hoy }),
        ReservasService.obtenerTodas(),
        ClientesService.obtenerTodos(),
      ]);
      setReservasHoy(rHoy);

      const month = new Date().getMonth();
      const year = new Date().getFullYear();
      const ingresos = rTodas
        .filter((r) => {
          if (r.estado !== "completada") return false;
          const [y, m] = r.fecha.split("-").map(Number);
          return m - 1 === month && y === year;
        })
        .reduce((s, r) => s + (r.precioTotal ?? 0), 0);

      const ocupacion =
        rHoy.length > 0 ? Math.round((rHoy.length / 10) * 100) : 0;

      setStats([
        {
          label: "Reservas hoy",
          value: String(rHoy.length),
          Icon: LuCalendar,
          color: "text-emerald-700",
          bg: "bg-emerald-50 ring-emerald-200",
        },
        {
          label: "Ingresos del month",
          value: MoneyUtils.formatear(ingresos),
          Icon: LuDollarSign,
          color: "text-sky-700",
          bg: "bg-sky-50 ring-sky-200",
        },
        {
          label: "Total clientes",
          value: String(clientes.length),
          Icon: LuUsers,
          color: "text-purple-700",
          bg: "bg-purple-50 ring-purple-200",
        },
        {
          label: "Ocupación hoy",
          value: `${ocupacion}%`,
          Icon: LuChartBarIncreasing,
          color: "text-amber-700",
          bg: "bg-amber-50 ring-amber-200",
        },
      ]);
    }
    cargar().catch(console.error);
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Resumen general de actividad del día
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats?.map(({ label, value, Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-slate-200/80 p-5"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-xl ring-1 ${bg} flex items-center justify-center flex-shrink-0`}
              >
                <Icon size={18} className={color} />
              </div>
            </div>
            <div
              className={`text-2xl font-extrabold tracking-tight leading-none mb-1 ${color}`}
            >
              {value}
            </div>
            <div className="text-[12px] text-slate-400 font-medium">
              {label}
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-slate-900">
            Reservas de hoy
          </h2>
          <span className="text-[12px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            {reservasHoy?.length} total
          </span>
        </div>
        <DashboardReservationsTable reservas={reservasHoy} />
      </div>
    </div>
  );
}
