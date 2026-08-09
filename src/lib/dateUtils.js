// All dates in 0-0-2 Desk are handled as local-time "YYYY-MM-DD" strings.
// We deliberately avoid new Date("YYYY-MM-DD") for arithmetic since that
// string form is parsed as UTC by JS and shifts a day in negative-UTC
// timezones. Instead we construct Date objects from Y/M/D components.

export function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function fromISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayISO() {
  return toISODate(new Date())
}

export function addDays(iso, delta) {
  const date = fromISODate(iso)
  date.setDate(date.getDate() + delta)
  return toISODate(date)
}

export function addMonths(iso, delta) {
  const date = fromISODate(iso)
  date.setMonth(date.getMonth() + delta)
  return toISODate(date)
}

// Week starts on Sunday to match WEEKDAY_LABELS.
export function startOfWeek(iso) {
  const date = fromISODate(iso)
  const day = date.getDay()
  return addDays(iso, -day)
}

export function getWeekDates(iso) {
  const start = startOfWeek(iso)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function startOfMonth(iso) {
  const date = fromISODate(iso)
  return toISODate(new Date(date.getFullYear(), date.getMonth(), 1))
}

// Returns a flat array of ISO date strings forming complete weeks
// (Sun-Sat) that cover the given month, including leading/trailing days
// from adjacent months so the calendar grid is always rectangular.
export function getMonthGrid(iso) {
  const first = fromISODate(startOfMonth(iso))
  const gridStart = addDays(toISODate(first), -first.getDay())
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
}

export function isSameMonth(isoA, isoB) {
  return isoA.slice(0, 7) === isoB.slice(0, 7)
}

export function isSameDay(isoA, isoB) {
  return isoA === isoB
}

export function formatDisplayDate(iso, opts = {}) {
  const date = fromISODate(iso)
  return date.toLocaleDateString('en-US', {
    weekday: opts.weekday ?? 'long',
    month: opts.month ?? 'long',
    day: 'numeric',
    year: opts.year ?? 'numeric',
  })
}

export function formatWeekRangeLabel(iso) {
  const dates = getWeekDates(iso)
  const start = fromISODate(dates[0])
  const end = fromISODate(dates[6])
  const monthShort = (d) => d.toLocaleDateString('en-US', { month: 'short' })
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()

  if (sameMonth) {
    return `${monthShort(start)} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`
  }
  const startLabel = `${monthShort(start)} ${start.getDate()}`
  const endLabel = `${monthShort(end)} ${end.getDate()}, ${end.getFullYear()}`
  return `${startLabel} – ${endLabel}`
}

export function formatMonthLabel(iso) {
  const date = fromISODate(iso)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
