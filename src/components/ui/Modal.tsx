import type { ReactNode } from 'react'

interface ModalProps {
  titulo: string
  children: ReactNode
  onClose: () => void
  footer?: ReactNode
}

export function Modal({ titulo, children, onClose, footer }: ModalProps) {
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{titulo}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
