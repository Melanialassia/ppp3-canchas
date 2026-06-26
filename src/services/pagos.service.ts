import api from "./api";

export type MetodoPago = "efectivo" | "tarjeta" | "transferencia";
export type TipoPago = "seña" | "saldo" | "completo" | "devolucion";

export const PagosService = {
  // Registrar un pago. api-pagos confirma la reserva automáticamente si se cubre la seña.
  async registrar(
    reservaId: number,
    monto: number,
    metodoPago: MetodoPago,
    tipoPago: TipoPago = "seña",
  ) {
    const { data } = await api.post("/pagos", {
      reservaId,
      monto,
      tipoPago,
      metodoPago,
    });
    return data.data ?? data;
  },

  async obtenerPorReserva(reservaId: number) {
    const { data } = await api.get("/pagos", { params: { reservaId } });
    return data;
  },
};
