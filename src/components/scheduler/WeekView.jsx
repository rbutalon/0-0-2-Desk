import { TIME_SLOTS, WEEKDAY_LABELS, BOOKING_STATUS } from '../../lib/constants'
import { fromISODate, todayISO } from '../../lib/dateUtils'

export default function WeekView({ weekDates, courts, getStatus, onSelectDate, screenshotMode }) {
  const today = todayISO()

  return (
    <div className="overflow-hidden rounded-2xl border border-court-line bg-white/40 shadow-card">
      <div className="scrollbar-thin overflow-x-auto">
        <div className="min-w-[640px]">
          <div
            className="grid border-b border-court-line bg-court-sand/40"
            style={{ gridTemplateColumns: `88px repeat(7, minmax(0, 1fr))` }}
          >
            <div />
            {weekDates.map((date) => {
              const d = fromISODate(date)
              const isToday = date === today
              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => onSelectDate(date)}
                  className={`cursor-pointer border-l border-court-line px-2 py-3 text-center transition-colors hover:bg-court-sage/15 ${
                    isToday ? 'bg-court-sage/20' : ''
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-court-ink-soft">
                    {WEEKDAY_LABELS[d.getDay()]}
                  </p>
                  <p className={`font-display text-sm font-bold ${isToday ? 'text-court-forest' : 'text-court-ink'}`}>
                    {d.getDate()}
                  </p>
                </button>
              )
            })}
          </div>

          {courts.map((court) => (
            <div
              key={court}
              className="grid border-b border-court-line last:border-b-0"
              style={{ gridTemplateColumns: `88px repeat(7, minmax(0, 1fr))` }}
            >
              <div className="flex items-center px-3 py-3 text-sm font-semibold text-court-ink">
                Court {court}
              </div>
              {weekDates.map((date) => {
                const statuses = TIME_SLOTS.map((slot) => getStatus(court, date, slot.value))
                const bookedCount = statuses.filter((s) => s === BOOKING_STATUS.BOOKED).length
                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => onSelectDate(date)}
                    className="group flex cursor-pointer flex-col items-center gap-1.5 border-l border-court-line px-2 py-3 transition-colors hover:bg-court-sage/10"
                    aria-label={`Court ${court}, ${date}: ${bookedCount} of ${TIME_SLOTS.length} slots booked`}
                  >
                    <div className="flex flex-wrap justify-center gap-[2px]">
                      {statuses.map((status, i) => (
                        <span
                          key={TIME_SLOTS[i].value}
                          className={`h-2.5 w-1.5 rounded-sm ${
                            status === BOOKING_STATUS.BOOKED
                              ? 'bg-court-forest'
                              : status === BOOKING_STATUS.UNAVAILABLE
                                ? 'bg-status-unavailable'
                                : 'bg-court-sand'
                          }`}
                        />
                      ))}
                    </div>
                    {!screenshotMode && (
                      <span className="tabular-nums text-[10px] font-medium text-court-ink-soft">
                        {bookedCount}/{TIME_SLOTS.length}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
