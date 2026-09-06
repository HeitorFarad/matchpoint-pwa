import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, variant = 'sheet' }) {
  if (!open) return null

  return (
    <div className={`modal-overlay${variant === 'center' ? ' modal-overlay-center' : ''}`} onClick={onClose}>
      <div
        className={`modal-content${variant === 'center' ? ' modal-content-center' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="modal-header">
            <p className="modal-title">{title}</p>
            <button className="modal-close" onClick={onClose} aria-label="Fechar">
              <X size={20} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
