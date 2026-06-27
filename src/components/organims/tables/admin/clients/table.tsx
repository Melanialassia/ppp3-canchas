import type { Cliente } from "@/types";

export const Table = ({ clientes }: { clientes: Cliente[] }) => {
  const header_table = [
    "Nombre",
    "Teléfono",
    "Email",
    "Tipo",
    "Reservas",
    "Descuento",
    "Estado",
  ];

  return (
    <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-200/80 shadow-(--shadow-card)">
      <table className="w-full border-collapse bg-white text-[13.5px]">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {header_table?.map((label: string) => (
              <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] whitespace-nowrap">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {clientes?.map((c) => (
            <tr key={c.id} className="hover:bg-brand-50/50 transition-colors">
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {c.nombre} {c.apellido}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {c.telefono}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {c.email ?? "—"}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {c.tipoClienteId ?? "—"}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {c.totalReservas ?? 0}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {c.descuentoPorcentaje ?? 0}%
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.75 text-[11.5px] font-semibold rounded-full whitespace-nowrap ${c.estado === "activo" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60" : "bg-red-50 text-red-700 ring-1 ring-red-200/60"}`}
                >
                  <span
                    className={`size-1.25 rounded-full flex-shrink-0 ${c.estado === "activo" ? "bg-emerald-500" : "bg-red-500"}`}
                  />
                  {c.estado ?? "activo"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
