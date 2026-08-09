import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  tone = 'danger',
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title="" maxWidth="max-w-sm">
      <div className="flex flex-col items-center gap-3 text-center">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full ${
            tone === 'danger' ? 'bg-status-danger-soft text-status-danger' : 'bg-court-sage/30 text-court-forest'
          }`}
        >
          <AlertTriangle size={20} />
        </div>
        <h3 className="font-display text-base font-semibold text-court-ink">{title}</h3>
        {description && <p className="text-sm text-court-ink-soft">{description}</p>}
      </div>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 cursor-pointer rounded-xl border border-court-line px-4 py-2.5 text-sm font-medium text-court-ink transition-colors hover:bg-court-cream"
        >
          Keep it
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${
            tone === 'danger' ? 'bg-status-danger hover:bg-status-danger/90' : 'bg-court-forest hover:bg-court-forest/90'
          }`}
        >
          {loading ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
