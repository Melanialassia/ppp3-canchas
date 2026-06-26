import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { Spinner } from "../../components/ui/Spinner";
import { BadgeReserva } from "../../components/ui/Badge";
import { useAlert } from "../../components/ui/Alert";
import { useAuth } from "../../context/AuthContext";
import { useReservas } from "../../hooks/useReservas";
import { useCanchas } from "../../hooks/useCanchas";
import { ReservasService } from "../../services/reservas.service";
import { DateUtils } from "../../utils/date.utils";
import { MoneyUtils } from "../../utils/money.utils";
import { EstadoUtils } from "../../utils/estado.utils";

export function MisReservasPage() {
  const { sesion } = useAuth();
  const { mostrar, AlertComponent } = useAlert();
  const params: Record<string, string> = sesion?.clienteId
    ? { clienteId: String(sesion.clienteId) }
    : {};
  const { reservas, loading, error, recargar } = useReservas(params);
  const { canchas } = useCanchas();
  const [cancelando, setCancelando] = useState<number | null>(null);

  const nombreCancha = (id: number) =>
    canchas.find((c) => c.id === id)?.nombre ?? `Cancha #${id}`;

  async function cancelar(id: number) {
    if (!confirm("¿Estás seguro que deseás cancelar esta reserva?")) return;
    setCancelando(id);
    try {
      await ReservasService.cancelar(
        id,
        "Cancelado por el cliente desde el portal",
      );
      mostrar("Reserva cancelada correctamente", "success");
      recargar();
    } catch (err) {
      mostrar(
        (err as Error).message || "Error al cancelar la reserva",
        "error",
      );
    } finally {
      setCancelando(null);
    }
  }

  return (
    <>
      <Header />
      {AlertComponent}

      <div className="w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Mis Reservas
            </h1>
            <p className="text-slate-400 text-sm mt-0.5 hidden sm:block">
              Historial y estado de tus reservas
            </p>
          </div>
          <Link
            to="/reservar"
            className="btn btn-primary btn-small sm:btn-primary"
          >
            <span className="hidden sm:inline">+ Nueva Reserva</span>
            <span className="sm:hidden">+ Nueva</span>
          </Link>
        </div>

        {loading && <Spinner />}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && reservas.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <p className="text-4xl mb-4">📅</p>
            <p className="text-slate-500 font-medium mb-1">
              Aún no tenés reservas
            </p>
            <p className="text-slate-400 text-sm mb-6">
              Hacé tu primera reserva en segundos
            </p>
            <Link to="/reservar" className="btn btn-primary">
              Hacer mi primera reserva
            </Link>
          </div>
        )}

        {!loading && reservas.length > 0 && (
          <>
            <div className="hidden sm:block table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Horario</th>
                    <th>Cancha</th>
                    <th>Estado</th>
                    <th>Total</th>
                    <th>Seña</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {reservas.map((r) => (
                    <tr key={r.id}>
                      <td className="font-medium">
                        {DateUtils.formatearFecha(r.fecha)}
                      </td>
                      <td className="font-mono text-[13px]">
                        {DateUtils.formatearHora(r.horaInicio)} – {DateUtils.formatearHora(r.horaFin)}
                      </td>
                      <td>{nombreCancha(r.canchaId)}</td>
                      <td>
                        <BadgeReserva estado={r.estado} />
                      </td>
                      <td className="font-semibold text-brand-700">
                        {MoneyUtils.formatear(r.precioTotal)}
                      </td>
                      <td>{MoneyUtils.formatear(r.senaRequerida ?? 0)}</td>
                      <td>
                        {EstadoUtils.puedeCanselar(r.estado) ? (
                          <button
                            className="btn btn-small btn-outline border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                            onClick={() => cancelar(r.id)}
                            disabled={cancelando === r.id}
                          >
                            {cancelando === r.id ? "…" : "Cancelar"}
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

            <div className="flex flex-col gap-3 sm:hidden">
              {reservas.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-slate-900 text-[15px]">
                        {nombreCancha(r.canchaId)}
                      </p>
                      <p className="text-slate-400 text-[12px] mt-0.5">
                        {DateUtils.formatearFecha(r.fecha)} · {DateUtils.formatearHora(r.horaInicio)} –{" "}
                        {DateUtils.formatearHora(r.horaFin)}
                      </p>
                    </div>
                    <BadgeReserva estado={r.estado} />
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                    <div>
                      <p className="text-[12px] text-slate-400">Total</p>
                      <p className="font-extrabold text-brand-700 text-[16px]">
                        {MoneyUtils.formatear(r.precioTotal)}
                      </p>
                    </div>
                    {EstadoUtils.puedeCanselar(r.estado) && (
                      <button
                        className="btn btn-small btn-outline border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => cancelar(r.id)}
                        disabled={cancelando === r.id}
                      >
                        {cancelando === r.id ? "…" : "Cancelar"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </>
  );
}
