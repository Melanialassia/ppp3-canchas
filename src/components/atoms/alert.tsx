import { useState, useEffect } from 'react'

interface AlertProps {
  mensaje: string
  tipo?: 'success' | 'error' | 'warning' | 'info'
  duracion?: number
  onClose?: () => void
}

const VARIANT: Record<string, string> = {
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  error:   'bg-red-50 text-red-800 border-red-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  info:    'bg-sky-50 text-sky-800 border-sky-200',
}

export function Alert({ mensaje, tipo = 'info', duracion = 4000, onClose }: AlertProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!duracion) return
    const t = setTimeout(() => { setVisible(false); onClose?.() }, duracion)
    return () => clearTimeout(t)
  }, [duracion, onClose])

  if (!visible) return null

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`px-4 py-3.5 rounded-xl flex items-start gap-3 text-[13.5px] border fixed top-4 right-4 z-9999 min-w-70 max-w-sm shadow-lg ${VARIANT[tipo]}`}
    >
      <span className="flex-1">{mensaje}</span>
      <button
        aria-label="Cerrar alerta"
        className="ml-3 text-lg leading-none opacity-60 hover:opacity-100 bg-transparent border-none cursor-pointer"
        onClick={() => { setVisible(false); onClose?.() }}
      >
        ×
      </button>
    </div>
  )
}

export function useAlert() {
  const [alert, setAlert] = useState<{ mensaje: string; tipo: 'success' | 'error' | 'warning' | 'info' } | null>(null)

  function mostrar(mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info' = 'info') {
    setAlert({ mensaje, tipo })
  }

  function cerrar() { setAlert(null) }

  const AlertComponent = alert
    ? <Alert mensaje={alert.mensaje} tipo={alert.tipo} onClose={cerrar} />
    : null

  return { mostrar, AlertComponent }
}
