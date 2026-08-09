import { Lock, Pencil, Plus, X } from 'lucide-react'
import { BOOKING_STATUS } from '../../lib/constants'

/**
 * One hourly slot for one court, in the admin-editable grid. Three states:
 *  - VACANT       -> dashed "add booking" affordance + a small quick-block icon
 *  - BOOKED       -> solid jade card with customer name + edit/cancel
 *  - UNAVAILABLE  -> slate/striped "blocked" card with a reason label
 *                    (e.g. "Tournament") + edit/unblock
 *
 * (Screenshot Mode uses its own dedicated ScreenshotDayCard component
 * instead of this one — see components/scheduler/ScreenshotDayCard.jsx.)
 */
export default function SlotCell({ booking, onAdd, onEdit, onCancel, onBlock }) {
  const status = booking?.status ?? BOOKING_STATUS.VACANT
  const isBooked = status === BOOKING_STATUS.BOOKED
  const isUnavailable = status === BOOKING_STATUS.UNAVAILABLE

  if (isBooked) {
    return (
      <div className="group relative flex h-16 flex-col justify-between overflow-hidden rounded-lg bg-court-forest px-2.5 py-2 text-court-cream sm:h-[68px]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-court-cream/80">
            Booked
          </span>
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Edit booking for ${booking.customer_name}`}
              className="cursor-pointer rounded p-0.5 hover:bg-white/20"
            >
              <Pencil size={12} />
            </button>
            <button
              type="button"
              onClick={onCancel}
              aria-label={`Cancel booking for ${booking.customer_name}`}
              className="cursor-pointer rounded p-0.5 hover:bg-white/20"
            >
              <X size={12} />
            </button>
          </div>
        </div>
        <p className="truncate text-sm font-semibold" title={booking.customer_name}>
          {booking.customer_name}
        </p>
      </div>
    )
  }

  if (isUnavailable) {
    return (
      <div className="group stripe-unavailable relative flex h-16 flex-col justify-between overflow-hidden rounded-lg bg-status-unavailable px-2.5 py-2 text-white sm:h-[68px]">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/80">
            <Lock size={10} />
            Blocked
          </span>
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Edit block: ${booking.customer_name}`}
              className="cursor-pointer rounded p-0.5 hover:bg-white/20"
            >
              <Pencil size={12} />
            </button>
            <button
              type="button"
              onClick={onCancel}
              aria-label={`Remove block: ${booking.customer_name}`}
              className="cursor-pointer rounded p-0.5 hover:bg-white/20"
            >
              <X size={12} />
            </button>
          </div>
        </div>
        <p className="truncate text-sm font-semibold" title={booking.customer_name}>
          {booking.customer_name || 'Unavailable'}
        </p>
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
        className="absolute right-1 top-1 cursor-pointer rounded p-0.5 text-court-sage opacity-0 transition-opacity hover:bg-court-forest/10 hover:text-status-unavailable group-hover:opacity-100"
      >
        <Lock size={11} />
      </button>
    </div>
  )
}
