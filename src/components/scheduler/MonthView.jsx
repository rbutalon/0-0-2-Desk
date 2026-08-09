import { WEEKDAY_LABELS, TIME_SLOTS } from '../../lib/constants'
import { getMonthGrid, isSameMonth, fromISODate, todayISO } from '../../lib/dateUtils'

export default function MonthView({ monthAnchor, courts, countsForDate, onSelectDate }) {
  const grid = getMonthGrid(monthAnchor)
  const today = todayISO()
  const capacity = TIME_SLOTS.length * courts.length

  return (
    <div className="overflow-hidden rounded-2xl border border-court-line bg-white/40 shadow-card">
      <div className="grid grid-cols-7 border-b border-court-line bg-court-sand/40">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-court-ink-soft">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {grid.map((date) => {
          const inMonth = isSameMonth(date, monthAnchor)
          const isToday = date === today
          const { booked, blocked } = countsForDate(date)
          const intensity = capacity > 0 ? booked / capacity : 0

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              className={`flex min-h-[76px] cursor-pointer flex-col items-start gap-1.5 border-b border-l border-court-line p-2 text-left transition-colors hover:bg-court-sage/10 first:border-l-0 sm:min-h-[92px] ${
                inMonth ? 'bg-transparent' : 'bg-court-cream/60'
              }`}
            >
              <span
                className={`font-display text-sm font-semibold ${
                  isToday
                    ? 'flex h-6 w-6 items-center justify-center rounded-full bg-court-forest text-white'
                    : inMonth
                      ? 'text-court-ink'
                      : 'text-court-ink-soft/50'
                }`}
              >
                {fromISODate(date).getDate()}
              </span>
              <div className="flex flex-wrap gap-1">
                {booked > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                      intensity > 0.66
                        ? 'bg-court-forest text-white'
                        : intensity > 0.33
                          ? 'bg-court-sage/50 text-court-ink'
                          : 'bg-court-sand/70 text-court-ink-soft'
                    }`}
                  >
                    {booked} booked
                  </span>
                )}
                {blocked > 0 && (
                  <span className="rounded-full bg-status-unavailable-soft px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-status-unavailable">
                    {blocked} blocked
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
