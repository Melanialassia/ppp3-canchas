export const ESTADOS_RESERVA: Record<string, { label: string; clase: string }> = {
  pendiente:  { label: 'Pendiente',  clase: 'badge-warning'  },
  confirmada: { label: 'Confirmada', clase: 'badge-success'  },
  cancelada:  { label: 'Cancelada',  clase: 'badge-danger'   },
  completada: { label: 'Completada', clase: 'badge-info'     },
  no_show:    { label: 'No Show',    clase: 'badge-secondary'},
}

export const ESTADOS_CANCHA: Record<string, { label: string; clase: string }> = {
  disponible:     { label: 'Disponible',     clase: 'badge-success' },
  mantenimiento:  { label: 'Mantenimiento',  clase: 'badge-warning' },
  fuera_servicio: { label: 'Fuera servicio', clase: 'badge-danger'  },
}

export const METODOS_PAGO = ['efectivo', 'tarjeta', 'transferencia'] as const

export const HORARIOS_DISPONIBLES = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00',
]
