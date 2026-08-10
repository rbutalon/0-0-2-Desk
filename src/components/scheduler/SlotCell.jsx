import { Lock, Plus, X } from 'lucide-react'
import { BOOKING_STATUS } from '../../lib/constants'

export default function SlotCell({ booking, disabled, onAdd, onEdit, onCancel, onBlock }) {
  const status = booking?.status ?? BOOKING_STATUS.VACANT
  const isBooked = status === BOOKING_STATUS.BOOKED
  const isUnavailable = status === BOOKING_STATUS.UNAVAILABLE

  if (isBooked) {
    return (
      <div
        className={`group relative flex h-16 flex-col justify-between overflow-hidden rounded-lg text-court-cream sm:h-[68px] ${
          disabled ? 'bg-court-forest/45' : 'bg-court-forest'
        }`}
      >
        <button
          type="button"
          onClick={onEdit}
          disabled={disabled}
          aria-label={`View booking for ${booking.customer_name}`}
          className={`absolute inset-0 h-full w-full px-2.5 py-2 text-left ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-court-cream/80">
            Booked
          </span>
          <p className="truncate pt-3 text-sm font-semibold" title={booking.customer_name}>
            {booking.customer_name}
          </p>
        </button>
        {!disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onCancel()
            }}
            aria-label={`Cancel booking for ${booking.customer_name}`}
            className="absolute right-1.5 top-1.5 cursor-pointer rounded p-0.5 opacity-0 transition-opacity hover:bg-white/20 group-hover:opacity-100 group-focus-within:opacity-100"
          >
            <X size={12} />
          </button>
        )}
      </div>
    )
  }

  if (isUnavailable) {
    return (
      <div
        className={`group stripe-unavailable relative flex h-16 flex-col justify-between overflow-hidden rounded-lg text-white sm:h-[68px] ${
          disabled ? 'bg-status-unavailable/45' : 'bg-status-unavailable'
        }`}
      >
        <button
          type="button"
          onClick={onEdit}
          disabled={disabled}
          aria-label={`View block: ${booking.customer_name}`}
          className={`absolute inset-0 h-full w-full px-2.5 py-2 text-left ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/80">
            <Lock size={10} />
            Blocked
          </span>
          <p className="truncate pt-3 text-sm font-semibold" title={booking.customer_name}>
            {booking.customer_name || 'Unavailable'}
          </p>
        </button>
        {!disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onCancel()
            }}
            aria-label={`Remove block: ${booking.customer_name}`}
            className="absolute right-1.5 top-1.5 cursor-pointer rounded p-0.5 opacity-0 transition-opacity hover:bg-white/20 group-hover:opacity-100 group-focus-within:opacity-100"
          >
            <X size={12} />
          </button>
        )}
      </div>
    )
  }

  if (disabled) {
    return (
      <div className="flex h-16 flex-col items-center justify-center gap-0.5 rounded-lg border border-court-line bg-court-cream/60 text-court-ink-soft/50 sm:h-[68px]">
        <span className="text-[10px] font-bold uppercase tracking-wider">Vacant</span>
      </div>
    )
  }

  return (
    <div className="group relative h-16 sm:h-[68px]">
      <button
        type="button"
        onClick={onAdd}
        className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border border-dashed border-court-sage/70 bg-white/60 text-court-sage transition-colors hover:border-court-forest hover:bg-court-sage/10 hover:text-court-forest"
      >
        <Plus size={14} className="opacity-70 group-hover:opacity-100" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Vacant</span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onBlock()
        }}
        aria-label="Block this slot"
        title="Block this slot"
        className="absolute right-1 top-1 cursor-pointer rounded p-0.5 text-court-sage opacity-40 transition-opacity hover:bg-court-forest/10 hover:text-status-unavailable group-hover:opacity-100"
      >
        <Lock size={11} />
      </button>
    </div>
  )
}
