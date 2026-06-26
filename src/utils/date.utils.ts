export const DateUtils = {
  formatearFecha(fecha: string): string {
    if (!fecha) return ''
    const [year, month, day] = fecha.split('-')
    return `${day}/${month}/${year}`
  },

  formatearFechaCompleta(fecha: string): string {
    if (!fecha) return ''
    const date = new Date(fecha + 'T00:00:00')
    return date.toLocaleDateString('es-AR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
  },

  fechaHoy(): string {
    return new Date().toISOString().split('T')[0]
  },

  horaActual(): string {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  },

  esHoy(fecha: string): boolean {
    return fecha === DateUtils.fechaHoy()
  },

  calcularDuracion(horaInicio: string, horaFin: string): number {
    const [h1, m1] = horaInicio.split(':').map(Number)
    const [h2, m2] = horaFin.split(':').map(Number)
    return (h2 * 60 + m2 - h1 * 60 - m1) / 60
  },
}
