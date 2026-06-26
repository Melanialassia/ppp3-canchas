import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClientesService } from "../../services/clientes.service";
import { ReservasService } from "../../services/reservas.service";
import { DateUtils } from "../../utils/date.utils";
import { MoneyUtils } from "../../utils/money.utils";
import { useAlert } from "../../components/ui/Alert";
import type { DatosCliente, DatosReserva } from "./ReservarPage";

interface Props {
  cliente: DatosCliente;
  reserva: DatosReserva;
  onBack: () => void;
}

export function Paso3Resumen({ cliente, reserva, onBack }: Props) {
  const navigate = useNavigate();
  const { mostrar, AlertComponent } = useAlert();
  const [observaciones, setObservaciones] = useState("");
  const [enviando, setEnviando] = useState(false);

  const duracion = DateUtils.calcularDuracion(
    reserva.horaInicio,
    reserva.horaFin,
  );
  const precioTotal = reserva.cancha.precioPorHora * duracion;
  const sena = MoneyUtils.calcularSena(precioTotal);

  async function confirmar() {
    setEnviando(true);
    try {
      let clienteId = cliente.id;
      if (cliente.esNuevo || !clienteId) {
        const nuevo = await ClientesService.crear({
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          telefono: cliente.telefono,
          email: cliente.email || undefined,
        });
        clienteId = nuevo.id;
      }
      await ReservasService.crear({
        canchaId: reserva.canchaId,
        clienteId: clienteId!,
        fecha: reserva.fecha,
        horaInicio: reserva.horaInicio,
        horaFin: reserva.horaFin,
        observaciones: observaciones.trim() || undefined,
      });
      mostrar("¡Reserva creada exitosamente!", "success");
      setTimeout(() => navigate("/mis-reservas"), 1500);
    } catch (err) {
      mostrar(
        (err as Error).message ||
          "Error al crear la reserva. Intentá de nuevo.",
        "error",
      );
      setEnviando(false);
    }
  }

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div>
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </span>
      <p className="text-[14px] font-semibold text-slate-800 mt-0.5">{value}</p>
    </div>
  );

  return (
    <div className="card-body">
      {AlertComponent}
      <h2 className="card-title mb-1">Paso 3: Confirmación</h2>
      <p className="text-sm text-slate-400 mb-6">
        Revisá los datos antes de confirmar tu reserva.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
        <InfoRow
          label="Cliente"
          value={`${cliente.nombre} ${cliente.apellido}`}
        />
        <InfoRow label="Teléfono" value={cliente.telefono} />
        <InfoRow label="Cancha" value={reserva.cancha.nombre} />
        <InfoRow
          label="Fecha"
          value={DateUtils.formatearFechaCompleta(reserva.fecha)}
        />
        <InfoRow
          label="Horario"
          value={`${DateUtils.formatearHora(reserva.horaInicio)} – ${DateUtils.formatearHora(reserva.horaFin)}`}
        />
        <InfoRow
          label="Duración"
          value={`${duracion} hora${duracion !== 1 ? "s" : ""}`}
        />
      </div>

      <div className="text-center mb-6 py-5 rounded-2xl bg-brand-50 border border-brand-100">
        <p className="text-[13px] text-brand-700 font-semibold mb-1">
          Precio total
        </p>
        <p className="text-4xl font-extrabold text-brand-700 tracking-tight leading-none">
          {MoneyUtils.formatear(precioTotal)}
        </p>
        <p className="text-[12.5px] text-slate-400 mt-2">
          Seña requerida (30%):{" "}
          <strong className="text-slate-600">
            {MoneyUtils.formatear(sena)}
          </strong>
        </p>
      </div>

      <div className="form-group">
        <label className="form-label">
          Observaciones{" "}
          <span className="text-slate-400 font-normal text-[12px]">
            (opcional)
          </span>
        </label>
        <textarea
          className="form-textarea"
          rows={3}
          placeholder="Alguna indicación especial para el personal…"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />
      </div>

      <div className="flex justify-between mt-6 pt-4 border-t border-slate-100">
        <button
          type="button"
          className="btn btn-outline"
          onClick={onBack}
          disabled={enviando}
        >
          ← Volver
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={confirmar}
          disabled={enviando}
        >
          {enviando ? "Procesando…" : "✓ Confirmar Reserva"}
        </button>
      </div>
    </div>
  );
}
