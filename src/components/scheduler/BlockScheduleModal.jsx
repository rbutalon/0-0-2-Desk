import { useState } from 'react'
import { Plus, Trash2, Sparkles } from 'lucide-react'
import Modal from '../common/Modal'
import {
  COURTS,
  OPEN_HOUR,
  CLOSE_HOUR,
  formatHourLabel,
  WEEKDAY_GROUPS,
  TOURNAMENT_BLOCK_PRESET,
} from '../../lib/constants'
import { fromISODate, toISODate, todayISO, addDays } from '../../lib/dateUtils'

const BOUNDARY_HOURS = Array.from({ length: CLOSE_HOUR - OPEN_HOUR + 1 }, (_, i) => OPEN_HOUR + i)

const DAY_GROUP_OPTIONS = [
  { id: 'WEEKDAYS', label: 'Weekdays (Mon–Fri)' },
  { id: 'WEEKENDS', label: 'Weekends (Sat–Sun)' },
  { id: 'ALL', label: 'Every day' },
]

function newRule(dayGroup = 'WEEKDAYS', start = 18, end = 21) {
  return { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, dayGroup, start, end }
}

export default function BlockScheduleModal({ open, onClose, onBlock, saving }) {
  const [reason, setReason] = useState('Tournament')
  const [fromDate, setFromDate] = useState(todayISO())
  const [toDate, setToDate] = useState(addDays(todayISO(), 6))
  const [courts, setCourts] = useState(COURTS)
  const [rules, setRules] = useState([newRule()])
  const [formError, setFormError] = useState('')
  const [resultMessage, setResultMessage] = useState('')

  function resetIfClosed() {
    setReason('Tournament')
    setFromDate(todayISO())
    setToDate(addDays(todayISO(), 6))
    setCourts(COURTS)
    setRules([newRule()])
    setFormError('')
    setResultMessage('')
  }

  function handleClose() {
    resetIfClosed()
    onClose()
  }

  function hourOf(timeValue) {
    return Number(timeValue.split(':')[0])
  }

  function applyTournamentPreset() {
    setReason(TOURNAMENT_BLOCK_PRESET.label)
    setRules([
      newRule('WEEKDAYS', hourOf(TOURNAMENT_BLOCK_PRESET.weekdayStart), hourOf(TOURNAMENT_BLOCK_PRESET.weekdayEnd)),
      newRule('WEEKENDS', hourOf(TOURNAMENT_BLOCK_PRESET.weekendStart), hourOf(TOURNAMENT_BLOCK_PRESET.weekendEnd)),
    ])
  }

  function toggleCourt(court) {
    setCourts((prev) => (prev.includes(court) ? prev.filter((c) => c !== court) : [...prev, court].sort()))
  }

  function updateRule(id, patch) {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  function addRule() {
    setRules((prev) => [...prev, newRule('ALL', 6, 22)])
  }

  function removeRule(id) {
    setRules((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev))
  }

  function addDaysDate(iso, delta) {
    const d = fromISODate(iso)
    d.setDate(d.getDate() + delta)
    return d
  }

  function buildPayloads() {
    const payloads = []
    const seen = new Set()
    let cursor = fromDate
    // Safety cap so a fat-fingered date range can't hang the browser.
    let guard = 0
    while (cursor <= toDate && guard < 400) {
      const weekday = fromISODate(cursor).getDay()
      for (const rule of rules) {
        const groupDays = WEEKDAY_GROUPS[rule.dayGroup]
        if (!groupDays.includes(weekday)) continue
        for (let hour = rule.start; hour < rule.end; hour++) {
          const timeSlot = `${String(hour).padStart(2, '0')}:00`
          for (const court of courts) {
            const key = `${court}-${cursor}-${timeSlot}`
            if (seen.has(key)) continue
            seen.add(key)
            payloads.push({
              court_id: court,
              booking_date: cursor,
              time_slot: timeSlot,
              customer_name: reason.trim() || 'Unavailable',
              status: 'UNAVAILABLE',
            })
          }
        }
      }
      cursor = toISODate(addDaysDate(cursor, 1))
      guard++
    }
    return payloads
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setResultMessage('')

    if (!fromDate || !toDate || fromDate > toDate) {
      setFormError('Pick a valid date range.')
      return
    }
    if (courts.length === 0) {
      setFormError('Select at least one court.')
      return
    }
    if (rules.some((r) => r.start >= r.end)) {
      setFormError('Each time range needs an end after its start.')
      return
    }

    const payloads = buildPayloads()
    if (payloads.length === 0) {
      setFormError('That combination doesn\u2019t match any slots. Check your date range and days.')
      return
    }

    setFormError('')
    const { data, skipped, error } = await onBlock(payloads)
    if (error) {
      setFormError(error.message ?? 'Something went wrong. Please try again.')
      return
    }
    const created = data?.length ?? 0
    setResultMessage(
      skipped > 0
        ? `Blocked ${created} slot${created === 1 ? '' : 's'}. Skipped ${skipped} already taken.`
        : `Blocked ${created} slot${created === 1 ? '' : 's'}.`
    )
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Block schedule"
      description="Close off a recurring range of slots — tournaments, maintenance, private events."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <button
          type="button"
          onClick={applyTournamentPreset}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-status-unavailable/40 bg-status-unavailable-soft px-4 py-2.5 text-sm font-semibold text-status-unavailable transition-colors hover:border-status-unavailable"
        >
          <Sparkles size={15} />
          Use tournament preset — 6–9pm weekdays, 5–9pm weekends
        </button>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-court-ink">
          Reason
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Tournament"
            className="rounded-lg border border-court-line bg-white px-3 py-2 text-sm outline-none focus:border-court-forest"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-court-ink">
            From
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              required
              className="rounded-lg border border-court-line bg-white px-3 py-2 text-sm outline-none focus:border-court-forest"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-court-ink">
            To
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              required
              className="rounded-lg border border-court-line bg-white px-3 py-2 text-sm outline-none focus:border-court-forest"
            />
          </label>
        </div>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1 text-sm font-medium text-court-ink">Courts</legend>
          <div className="flex gap-2">
            {COURTS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => toggleCourt(c)}
                aria-pressed={courts.includes(c)}
                className={`flex-1 cursor-pointer rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                  courts.includes(c)
                    ? 'border-court-forest bg-court-forest/10 text-court-forest'
                    : 'border-court-line text-court-ink-soft hover:bg-court-cream'
                }`}
              >
                Court {c}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-0.5 text-sm font-medium text-court-ink">Time ranges to block</legend>
          {rules.map((rule) => (
            <div key={rule.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-court-line bg-court-cream/60 p-2.5">
              <select
                value={rule.dayGroup}
                onChange={(e) => updateRule(rule.id, { dayGroup: e.target.value })}
                className="cursor-pointer rounded-lg border border-court-line bg-white px-2.5 py-1.5 text-xs font-medium outline-none"
              >
                {DAY_GROUP_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
              <select
                value={rule.start}
                onChange={(e) => updateRule(rule.id, { start: Number(e.target.value) })}
                className="cursor-pointer rounded-lg border border-court-line bg-white px-2.5 py-1.5 text-xs font-medium outline-none"
              >
                {BOUNDARY_HOURS.map((h) => (
                  <option key={h} value={h}>{formatHourLabel(h)}</option>
                ))}
              </select>
              <span className="text-xs text-court-ink-soft">to</span>
              <select
                value={rule.end}
                onChange={(e) => updateRule(rule.id, { end: Number(e.target.value) })}
                className="cursor-pointer rounded-lg border border-court-line bg-white px-2.5 py-1.5 text-xs font-medium outline-none"
              >
                {BOUNDARY_HOURS.map((h) => (
                  <option key={h} value={h}>{formatHourLabel(h)}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeRule(rule.id)}
                aria-label="Remove this time range"
                className="ml-auto cursor-pointer rounded-lg p-1.5 text-court-ink-soft transition-colors hover:bg-status-danger-soft hover:text-status-danger"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addRule}
            className="flex cursor-pointer items-center gap-1.5 self-start rounded-lg px-2 py-1.5 text-xs font-semibold text-court-forest hover:bg-court-sage/15"
          >
            <Plus size={13} />
            Add another time range
          </button>
        </fieldset>

        {formError && (
          <p role="alert" className="text-sm font-medium text-status-danger">
            {formError}
          </p>
        )}
        {resultMessage && (
          <p role="status" className="text-sm font-medium text-court-forest">
            {resultMessage}
          </p>
        )}

        <div className="mt-1 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="cursor-pointer rounded-xl border border-court-line px-4 py-2.5 text-sm font-medium text-court-ink transition-colors hover:bg-court-cream"
          >
            {resultMessage ? 'Done' : 'Cancel'}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="cursor-pointer rounded-xl bg-status-unavailable px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-status-unavailable/90 disabled:opacity-60"
          >
            {saving ? 'Blocking…' : 'Block slots'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
