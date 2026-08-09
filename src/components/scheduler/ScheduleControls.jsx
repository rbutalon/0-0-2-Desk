import { ChevronLeft, ChevronRight, Plus, Lock } from 'lucide-react'
import { COURTS, VIEW_MODES } from '../../lib/constants'

const VIEW_OPTIONS = [
  { id: VIEW_MODES.DAY, label: 'Day' },
  { id: VIEW_MODES.WEEK, label: 'Week' },
  { id: VIEW_MODES.MONTH, label: 'Month' },
]

export default function ScheduleControls({
  courtFilter,
  onCourtFilterChange,
  view,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  onNewBooking,
  onBlockSchedule,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-xl border border-court-line bg-white p-1 shadow-card">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous"
            className="cursor-pointer rounded-lg p-1.5 text-court-ink-soft transition-colors hover:bg-court-cream hover:text-court-ink"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={onToday}
            className="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-semibold text-court-ink transition-colors hover:bg-court-cream"
          >
            Today
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next"
            className="cursor-pointer rounded-lg p-1.5 text-court-ink-soft transition-colors hover:bg-court-cream hover:text-court-ink"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center rounded-xl border border-court-line bg-white p-1 shadow-card">
          {VIEW_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onViewChange(opt.id)}
              aria-pressed={view === opt.id}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                view === opt.id
                  ? 'bg-court-sage/40 text-court-ink'
                  : 'text-court-ink-soft hover:bg-court-cream'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <select
          value={courtFilter}
          onChange={(e) => onCourtFilterChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          aria-label="Filter by court"
          className="cursor-pointer rounded-xl border border-court-line bg-white px-3 py-2 text-sm font-medium text-court-ink shadow-card outline-none"
        >
          <option value="all">All courts</option>
          {COURTS.map((c) => (
            <option key={c} value={c}>
              Court {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBlockSchedule}
          className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-status-unavailable/30 bg-white px-4 py-2.5 text-sm font-semibold text-status-unavailable shadow-card transition-colors hover:bg-status-unavailable-soft"
        >
          <Lock size={15} />
          Block schedule
        </button>
        <button
          type="button"
          onClick={onNewBooking}
          className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-court-forest px-4 py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-court-forest/90"
        >
          <Plus size={16} />
          New booking
        </button>
      </div>
    </div>
  )
}
