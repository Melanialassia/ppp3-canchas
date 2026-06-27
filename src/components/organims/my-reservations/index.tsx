import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Spinner, useAlert } from "@/components/atoms";
import { useAuth } from "@/context";
import { useReservas } from "@/hooks";
import { ReservasService } from "@/services";
import { ReservationsTable } from "@/components/organims/tables";
import { PublicLayout } from "@/components/layouts";

export function ReservartionsPage() {
  const { sesion } = useAuth();
  const { mostrar, AlertComponent } = useAlert();
  const clienteId = sesion?.clienteId;
  const [canceled, setCanceled] = useState<number | null>(null);
  const params = useMemo(
    () => (clienteId ? { clienteId: String(clienteId) } : undefined),
    [clienteId],
  );
  const { reservas, loading, error, recargar } = useReservas(params);

  const handleSubmit = async (id: number) => {
    if (!confirm("¿Estás seguro que deseás cancelar esta reserva?")) return;
    setCanceled(id);
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
      setCanceled(null);
    }
  };

  return (
    <PublicLayout>
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
        {error && (
          <div className="px-4 py-3.5 rounded-xl flex items-start gap-3 text-[13.5px] border bg-red-50 text-red-800 border-red-200">
            {error}
          </div>
        )}
        <ReservationsTable
          loading={loading}
          error={error ?? ''}
          reservas={reservas}
          handleSubmit={handleSubmit}
          canceled={canceled}
        />
      </div>
    </PublicLayout>
  );
}
