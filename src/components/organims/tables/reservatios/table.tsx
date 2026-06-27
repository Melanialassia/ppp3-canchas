import { BadgeReserva } from "@/components/atoms";
import type { Reserva } from "@/types";
import { DateUtils, MoneyUtils, EstadoUtils } from "@/utils";

export const Table = ({
  reservas,
  canceled,
  handleSubmit,
}: {
  reservas: Reserva[];
  canceled: number | null;
  handleSubmit: (id: number) => Promise<void>;
}) => {
  const header_tabs = [
    "Fecha",
    "Horario",
    "Cancha",
    "Estado",
    "Total",
    "Seña",
    "",
  ];

  return (
    <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-200/80 shadow-(--shadow-card)">
      <table className="w-full border-collapse bg-white text-[13.5px]">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {header_tabs?.map((label: string) => (
              <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] whitespace-nowrap">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reservas?.map((r) => (
            <tr key={r.id} className="hover:bg-brand-50/50 transition-colors">
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle font-medium">
                {DateUtils.formatearFecha(r.fecha)}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle font-mono text-[13px]">
                {DateUtils.formatearHora(r.horaInicio)} –{" "}
                {DateUtils.formatearHora(r.horaFin)}
              </td>
              {/* <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {handleSubmit(r.canchaId)}
              </td> */}
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                <BadgeReserva estado={r.estado} />
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 align-middle font-semibold text-brand-700">
                {MoneyUtils.formatear(r.precioTotal)}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {MoneyUtils.formatear(r.senaRequerida ?? 0)}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {EstadoUtils.puedeCanselar(r.estado) ? (
                  <button
                    className="btn btn-small btn-outline border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    onClick={() => handleSubmit(r.id)}
                    disabled={canceled === r.id}
                  >
                    {canceled === r.id ? "…" : "Cancelar"}
                  </button>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
