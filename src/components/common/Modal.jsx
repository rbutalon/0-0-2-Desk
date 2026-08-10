import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
}) {
  const dialogRef = useRef(null)
  const onCloseRef = useRef(onClose)

  // Keep the latest onClose without causing the focus effect to re-run
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onCloseRef.current()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // Save whatever element had focus before opening
    const previouslyFocused = document.activeElement

    // Focus the dialog only when the modal actually opens
    dialogRef.current?.focus()

    // Prevent background scroll while modal is open
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow

      // Restore focus when the modal closes
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus()
      }
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
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
          <>
            <div className="flex items-start justify-between px-6 pt-5">
              <div>
                <h2
                  id="modal-title"
                  className="text-lg font-semibold text-court-ink"
                >
                  {title}
                </h2>

                {description && (
                  <p className="mt-1 text-sm text-court-ink-soft">
                    {description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="rounded-lg p-1.5 text-court-ink-soft transition-colors hover:bg-court-cream hover:text-court-ink"
              >
                <X size={18} />
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute right-4 top-4 rounded-lg p-1.5 text-court-ink-soft transition-colors hover:bg-court-cream hover:text-court-ink"
          >
            <X size={18} />
          </button>
        )}

        <div className={title ? 'px-6 py-5' : 'px-6 pb-6 pt-10'}>
          {children}
        </div>
      </div>
    </div>
  )
}