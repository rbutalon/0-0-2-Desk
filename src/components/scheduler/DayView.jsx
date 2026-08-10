import { CalendarOff } from 'lucide-react'
import { TIME_SLOTS, BOOKING_STATUS } from '../../lib/constants'
import { todayISO } from '../../lib/dateUtils'
import SlotCell from './SlotCell'

export default function DayView({ date, courts, bookingsBySlot, onAdd, onEdit, onCancel, onBlock }) {
  const isPast = date < todayISO()

  return (
    <div>
      {isPast && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-court-line bg-court-ink-soft/40 px-3.5 py-2.5 text-sm font-medium text-court-ink">
          <CalendarOff size={15} />
          This date has passed (the schedule is read-only).
        </div>
      )}
      <div className="scrollbar-thin overflow-x-auto rounded-2xl border border-court-line bg-white/40 shadow-card">
        <div
          className="grid min-w-[560px]"
          style={{ gridTemplateColumns: `72px repeat(${courts.length}, minmax(0, 1fr))` }}
        >
          {/* Header row */}
          <div className="sticky top-0 z-10 border-b border-court-line bg-court-sand/40 px-2 py-3" />
          {courts.map((court) => {
            const courtBookings = TIME_SLOTS.map((slot) => bookingsBySlot[`${court}-${slot.value}`]).filter(Boolean)
            const bookedCount = courtBookings.filter((b) => b.status === BOOKING_STATUS.BOOKED).length
            const blockedCount = courtBookings.filter((b) => b.status === BOOKING_STATUS.UNAVAILABLE).length
            return (
              <div
                key={court}
                className="sticky top-0 z-10 border-b border-l border-court-line bg-court-sand/40 px-3 py-3 text-center"
              >
                <p className="font-display text-sm font-bold text-court-ink">Court {court}</p>
                <p className="text-[11px] font-medium text-court-ink-soft">
                  {bookedCount}/{TIME_SLOTS.length} booked
                  {blockedCount > 0 && <span className="text-status-unavailable"> · {blockedCount} blocked</span>}
                </p>
              </div>
            )
          })}

          {/* Time rows */}
          {TIME_SLOTS.map((slot) => (
            <div className="contents" key={slot.value}>
              <div className="flex items-center justify-end border-b border-court-line px-2 py-1.5 text-right">
                <span className="tabular-nums font-mono text-[11px] font-medium text-court-ink-soft">
                  {slot.label}
                </span>
              </div>
              {courts.map((court) => {
                const booking = bookingsBySlot[`${court}-${slot.value}`] ?? null
                return (
                  <div key={`${court}-${slot.value}`} className="border-b border-l border-court-line p-1.5">
                    <SlotCell
                      booking={booking}
                      disabled={isPast}
                      onAdd={() => onAdd({ court, date, slot })}
                      onEdit={() => onEdit(booking)}
                      onCancel={() => onCancel(booking)}
                      onBlock={() => onBlock({ court, date, slot })}
                    />
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
