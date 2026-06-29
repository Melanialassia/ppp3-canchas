import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAlert, Select, SelectItem, Modal } from "@/components/atoms";
import { useAuth } from "@/context";
import { useReservas, useSaldosReservas, useCanchas } from "@/hooks";
import { ReservasService } from "@/services";
import { ReservaUtils } from "@/utils";
import { ReservationsTable } from "@/components/organims/tables";
import { PublicLayout } from "@/components/layouts";
import { ModalPagoReserva } from "./ModalPagoReserva";
import type { Reserva } from "@/types";

export function ReservartionsPage() {
  const { sesion } = useAuth();
  const { mostrar, AlertComponent } = useAlert();
  const clienteId = sesion?.clienteId;
  const [canceled, setCanceled] = useState<number | null>(null);
  const [reservaPago, setReservaPago] = useState<Reserva | null>(null);
  const [reservaACancelar, setReservaACancelar] = useState<Reserva | null>(null);
  const [cancelando, setCancelando] = useState(false);
  const [ordenFecha, setOrdenFecha] = useState<"asc" | "desc">("desc");
  const [filtroEstado, setFiltroEstado] = useState("");
  const params = useMemo(
    () => (clienteId ? { clienteId: String(clienteId) } : undefined),
    [clienteId],
  );
  const { reservas, loading, error, recargar } = useReservas(params);
  const { canchas } = useCanchas();
  const reservasView = useMemo(() => {
    const enriquecidas = ReservaUtils.enriquecer(reservas, canchas);
    const filtradas = filtroEstado
      ? enriquecidas.filter((r) => r.estado === filtroEstado)
      : enriquecidas;
    return [...filtradas].sort((a, b) =>
      ordenFecha === "desc"
        ? b.fecha.localeCompare(a.fecha)
        : a.fecha.localeCompare(b.fecha)
    );
  }, [reservas, canchas, filtroEstado, ordenFecha]);
  const reservaIds = useMemo(() => reservas.map((r) => r.id), [reservas]);
  const {
    saldos,
    loading: saldosLoading,
    refrescar: refrescarSaldos,
  } = useSaldosReservas(reservaIds);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const status = searchParams.get("status");
    const paymentId = searchParams.get("payment_id");
    const collectionStatus = searchParams.get("collection_status");
    const finalStatus = status || collectionStatus;

    if (finalStatus || paymentId) {
      if (finalStatus === "approved" || finalStatus === "success") {
        mostrar("¡Pago realizado con éxito! Tu reserva ha sido confirmada.", "success");
      } else if (finalStatus === "pending" || finalStatus === "in_process") {
        mostrar("El pago está en proceso de acreditación.", "info");
      } else {
        mostrar("El pago fue rechazado, cancelado o falló. Por favor, reintentalo.", "error");
      }

      // Clean query parameters from URL so that refreshing the page doesn't alert again
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("status");
      newParams.delete("payment_id");
      newParams.delete("preference_id");
      newParams.delete("merchant_order_id");
      newParams.delete("collection_id");
      newParams.delete("collection_status");
      newParams.delete("payment_type");
      newParams.delete("processing_mode");
      newParams.delete("site_id");
      newParams.delete("merchant_account_id");
      setSearchParams(newParams, { replace: true });

      // Refresh the reservation list and their balances
      recargar();
      refrescarSaldos();
    }
  }, [searchParams, setSearchParams, recargar, refrescarSaldos, mostrar]);

  async function confirmarCancelacion() {
    if (!reservaACancelar) return;
    setCancelando(true);
    setCanceled(reservaACancelar.id);
    try {
      await ReservasService.cancelar(
        reservaACancelar.id,
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
      setCancelando(false);
      setCanceled(null);
      setReservaACancelar(null);
    }
  }

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
        <div className="flex gap-4 mb-6 flex-wrap items-end">
          <div>
            <label className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">
              Estado
            </label>
            <Select value={filtroEstado} onValueChange={setFiltroEstado} placeholder="Todos">
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="confirmada">Confirmada</SelectItem>
              <SelectItem value="completada">Completada</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
              <SelectItem value="no_show">No Show</SelectItem>
            </Select>
          </div>
        </div>
        {error && (
          <div className="px-4 py-3.5 rounded-xl flex items-start gap-3 text-[13.5px] border bg-red-50 text-red-800 border-red-200 mb-4">
            {error}
          </div>
        )}
        <ReservationsTable
          loading={loading}
          error={error ?? ''}
          reservas={reservasView}
          handleSubmit={(id) => {
            const r = reservas.find((r) => r.id === id);
            if (r) setReservaACancelar(r);
          }}
          canceled={canceled}
          onPagar={setReservaPago}
          saldos={saldos}
          saldosLoading={saldosLoading}
          ordenFecha={ordenFecha}
          onOrdenFecha={() => setOrdenFecha((v) => (v === "desc" ? "asc" : "desc"))}
        />
      </div>

      {reservaACancelar && (
        <Modal
          titulo="Cancelar reserva"
          onClose={() => setReservaACancelar(null)}
          footer={
            <div className="flex gap-2 justify-end">
              <button
                className="btn btn-outline"
                onClick={() => setReservaACancelar(null)}
                disabled={cancelando}
              >
                No
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmarCancelacion}
                disabled={cancelando}
              >
                {cancelando ? "Cancelando…" : "Sí, cancelar"}
              </button>
            </div>
          }
        >
          <p className="text-slate-600">
            ¿Estás seguro que deseás cancelar la reserva <span className="font-semibold text-slate-800">#{reservaACancelar.id}</span>? Esta acción no se puede deshacer.
          </p>
        </Modal>
      )}

      {reservaPago && (
        <ModalPagoReserva
          reserva={reservaPago}
          onClose={() => setReservaPago(null)}
          onPagado={() => {
            setReservaPago(null);
            mostrar("Pago registrado correctamente", "success");
            recargar();
            refrescarSaldos();
          }}
        />
      )}
    </PublicLayout>
  );
}
