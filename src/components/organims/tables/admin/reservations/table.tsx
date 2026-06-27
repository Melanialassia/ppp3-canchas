import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BadgeReserva } from "@/components/atoms";
import { BsThreeDotsVertical } from "react-icons/bs";
import type { Reserva } from "@/types";
import { DateUtils, MoneyUtils } from "@/utils";

export interface AccionItem {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

function DotsMenu({ acciones }: { acciones: AccionItem[] }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const inTrigger = triggerRef.current?.contains(target) ?? false;
      const inContent = contentRef.current?.contains(target) ?? false;
      if (!inTrigger && !inContent) setOpen(false);
    };
    document.addEventListener("mouseover", handler);
    return () => document.removeEventListener("mouseover", handler);
  }, [open]);

  function handleOpen() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ top: rect.bottom + 4, left: rect.left });
    setOpen(true);
  }

  if (acciones?.length === 0) return <span />;

  return (
    <>
      <button
        ref={triggerRef}
        className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        aria-label="Acciones"
        onClick={handleOpen}
      >
        <BsThreeDotsVertical size={16} />
      </button>

      {open && createPortal(
        <div
          ref={contentRef}
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-50 min-w-[160px] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {acciones.map((item) => (
            <button
              key={item.label}
              className={`flex w-full items-center px-4 py-2 text-[13px] transition-colors bg-transparent border-none cursor-pointer font-[inherit] text-left ${
                item.variant === "danger"
                  ? "text-red-600 hover:bg-red-50 hover:text-red-700"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
              onClick={() => { item.onClick(); setOpen(false); }}
            >
              {item.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

export const Table = ({
  reservas,
  ordenFecha,
  onOrdenFecha,
  getAcciones,
}: {
  reservas: Reserva[];
  ordenFecha: "desc" | "asc";
  onOrdenFecha: () => void;
  getAcciones: (r: Reserva) => AccionItem[];
}) => {
  const header_table = [
    "Horario inicio",
    "Horario finalización",
    "Cancha",
    "Cliente",
    "Estado",
    "Total",
  ];

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-(--shadow-card)">
      <table className="w-full border-collapse bg-white text-[13.5px]">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th
              className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] whitespace-nowrap"
              style={{ width: 40 }}
            />
            <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] whitespace-nowrap">
              <button
                onClick={onOrdenFecha}
                className="flex items-center gap-1 font-semibold text-inherit hover:text-brand-700 transition-colors bg-transparent border-none cursor-pointer p-0"
              >
                Fecha
                <span className="text-slate-400 text-[11px]">
                  {ordenFecha === "desc" ? "↓" : "↑"}
                </span>
              </button>
            </th>
            {header_table?.map((label: string) => (
              <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] whitespace-nowrap">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reservas?.map((r) => (
            <tr key={r.id} className="hover:bg-brand-50/50 transition-colors">
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                <DotsMenu acciones={getAcciones(r)} />
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {DateUtils.formatearFecha(r.fecha)}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {DateUtils.formatearHora(r.horaInicio)}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {DateUtils.formatearHora(r.horaFin)}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {r.canchaNombre ?? `${r.canchaId}`}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {r.clienteNombre ?? `Cliente #${r.clienteId}`}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                <BadgeReserva estado={r.estado} />
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {MoneyUtils.formatear(r.precioTotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
