export type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada' | 'completada' | 'no_show'
export type EstadoCancha = 'disponible' | 'mantenimiento' | 'fuera_servicio'

export interface Cancha {
  id: number
  nombre: string
  capacidad: number
  precioPorHora: number
  estado: EstadoCancha
  descripcion?: string
}

export interface Reserva {
  id: number
  canchaId: number
  canchaNombre?: string
  clienteId: number
  clienteNombre?: string
  clienteApellido?: string
  clienteTelefono?: string
  fecha: string
  horaInicio: string
  horaFin: string
  estado: EstadoReserva
  precioTotal: number
  descuentoAplicado?: number
  senaRequerida: number
  observaciones?: string
  fechaCreacion?: string
}

export interface Cliente {
  id: number
  nombre: string
  apellido: string
  telefono: string
  email?: string
  tipoClienteId?: number
  estado?: string
  // Derivados (no provienen del recurso /clientes; se obtienen por endpoints aparte)
  descuentoPorcentaje?: number
  totalReservas?: number
  noShows?: number
}

export interface DisponibilidadHorario {
  horaInicio: string
  horaFin: string
  disponible: boolean
  esPasado?: boolean
}

export interface ApiError {
  message: string
  statusCode?: number
}

export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia'
export type TipoPago   = 'seña' | 'saldo' | 'completo' | 'devolucion'
