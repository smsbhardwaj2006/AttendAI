import Icon from './Icon'

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  if (!open) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`relative w-full ${sizes[size]} bg-card rounded-lg shadow-pop animate-[fadeIn_0.15s_ease-out]`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h3 className="font-display font-semibold text-base">{title}</h3>
          <button onClick={onClose} className="text-ink400 hover:text-ink900 transition-colors" aria-label="Close">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-line flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}
