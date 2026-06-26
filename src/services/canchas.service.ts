import api from "./api";
import type { Cancha, EstadoCancha } from "../types/api";

export const CanchasService = {
  async obtenerTodas(): Promise<Cancha[]> {
    const { data } = await api.get("/canchas");
    return data;
  },

  async obtenerPorId(id: number): Promise<Cancha> {
    const { data } = await api.get(`/canchas/${id}`);
    return data;
  },

  async crear(datos: Partial<Cancha>): Promise<Cancha> {
    const { data } = await api.post("/canchas", datos);
    return data;
  },

  async actualizar(id: number, datos: Partial<Cancha>): Promise<Cancha> {
    const { data } = await api.put(`/canchas/${id}`, datos);
    return data;
  },

  async cambiarEstado(id: number, estado: EstadoCancha): Promise<Cancha> {
    const { data } = await api.patch(`/canchas/${id}`, { estado });
    return data;
  },

  async verDisponibilidad(id: number, fecha: string): Promise<unknown> {
    const { data } = await api.get("/disponibilidad", {
      params: { canchaId: id, fecha },
    });
    return data;
  },
};
