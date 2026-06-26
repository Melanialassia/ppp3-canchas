import { useState, useEffect } from 'react'

interface AlertProps {
  mensaje: string
  tipo?: 'success' | 'error' | 'warning' | 'info'
  duracion?: number
  onClose?: () => void
}

export function Alert({ mensaje, tipo = 'info', duracion = 4000, onClose }: AlertProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!duracion) return
    const t = setTimeout(() => { setVisible(false); onClose?.() }, duracion)
    return () => clearTimeout(t)
  }, [duracion, onClose])

  if (!visible) return null

  const claseMap = {
    success: 'alert-success',
    error:   'alert-danger',
    warning: 'alert-warning',
    info:    'alert-info',
  }

  return (
    <div
      className={`alert ${claseMap[tipo]} fixed top-4 right-4 z-[9999] min-w-[280px] max-w-sm shadow-lg`}
    >
      <span className="flex-1">{mensaje}</span>
      <button
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
