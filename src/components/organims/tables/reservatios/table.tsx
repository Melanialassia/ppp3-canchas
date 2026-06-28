import { BadgeReserva } from "@/components/atoms";
import type { Reserva, SaldoReserva } from "@/types";
import { DateUtils, MoneyUtils, EstadoUtils } from "@/utils";

export const Table = ({
  reservas,
  canceled,
  handleSubmit,
  onPagar,
  saldos,
  saldosLoading,
}: {
  reservas: Reserva[];
  canceled: number | null;
  handleSubmit: (id: number) => Promise<void>;
  onPagar: (reserva: Reserva) => void;
  saldos: Record<number, SaldoReserva>;
  saldosLoading: boolean;
}) => {
  const puedePagar = (estado: Reserva["estado"]) =>
    estado === "pendiente" || estado === "confirmada";

  const header_tabs = [
    "Fecha",
    "Horario",
    "Cancha",
    "Estado",
    "Total",
    "Seña",
    "Abonado",
    "Falta",
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
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {r.canchaNombre ?? `Cancha #${r.canchaId}`}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                <BadgeReserva estado={r.estado} />
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 align-middle font-semibold text-brand-700">
                {MoneyUtils.formatear(r.precioTotal)}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {MoneyUtils.formatear(r.senaRequerida ?? 0)}
              </td>
              {(() => {
                const s = saldos[r.id];
                return (
                  <>
                    <td className="px-4 py-3.5 border-b border-slate-100/80 align-middle font-semibold text-emerald-700">
                      {s ? MoneyUtils.formatear(s.totalPagado) : saldosLoading ? "…" : "—"}
                    </td>
                    <td className="px-4 py-3.5 border-b border-slate-100/80 align-middle font-semibold">
                      {s && s.saldoPendiente != null ? (
                        s.saldoPendiente <= 0 ? (
                          <span className="text-emerald-700">Pagado</span>
                        ) : (
                          <span className="text-amber-700">
                            {MoneyUtils.formatear(s.saldoPendiente)}
                          </span>
                        )
                      ) : saldosLoading ? (
                        "…"
                      ) : (
                        "—"
                      )}
                    </td>
                  </>
                );
              })()}
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {puedePagar(r.estado) || EstadoUtils.puedeCanselar(r.estado) ? (
                  <div className="flex gap-2 justify-end">
                    {puedePagar(r.estado) && (
                      <button
                        className="btn btn-small btn-outline border-brand-200 text-brand-700 hover:bg-brand-50 hover:border-brand-300"
                        onClick={() => onPagar(r)}
                      >
                        Pagar
                      </button>
                    )}
                    {EstadoUtils.puedeCanselar(r.estado) && (
                      <button
                        className="btn btn-small btn-outline border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        onClick={() => handleSubmit(r.id)}
                        disabled={canceled === r.id}
                      >
                        {canceled === r.id ? "…" : "Cancelar"}
                      </button>
                    )}
                  </div>
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
