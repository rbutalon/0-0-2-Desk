import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, description, children, maxWidth = 'max-w-lg' }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!open) return

    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)

    // Move focus into the dialog for keyboard + screen reader users.
    const previouslyFocused = document.activeElement
    dialogRef.current?.focus()

    // Prevent background scroll while a modal is open.
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-court-ink/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-label={title ? undefined : 'Dialog'}
        tabIndex={-1}
        className={`relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-pop animate-modal-in`}
      >
        {title ? (
          <div className="sticky top-0 flex items-start justify-between gap-4 rounded-t-2xl border-b border-court-line bg-white px-6 py-5">
            <div>
              <h2 id="modal-title" className="font-display text-lg font-semibold text-court-ink">
                {title}
              </h2>
              {description && (
                <p className="mt-1 text-sm text-court-ink-soft">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="cursor-pointer rounded-full p-1.5 text-court-ink-soft transition-colors hover:bg-court-cream hover:text-court-ink"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute right-4 top-4 cursor-pointer rounded-full p-1.5 text-court-ink-soft transition-colors hover:bg-court-cream hover:text-court-ink"
          >
            <X size={18} />
          </button>
        )}
        <div className={title ? 'px-6 py-5' : 'px-6 pb-6 pt-10'}>{children}</div>
      </div>
    </div>
  )
}
