import { useEffect, useState } from 'react'
import Modal from '../common/Modal'
import { COURTS, TIME_SLOTS, BOOKING_STATUS } from '../../lib/constants'

const emptyForm = { court_id: COURTS[0], booking_date: '', time_slot: TIME_SLOTS[0].value, customer_name: '', notes: '' }

export default function BookingModal({ open, mode, kind, initial, onClose, onSave, onRequestCancel, isSlotTaken, saving }) {
  const [form, setForm] = useState(emptyForm)
  const [activeKind, setActiveKind] = useState(kind ?? 'booking')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && initial) {
      setForm({
        court_id: initial.court_id,
        booking_date: initial.booking_date,
        time_slot: initial.time_slot,
        customer_name: initial.customer_name,
        notes: initial.notes ?? '',
      })
      setActiveKind(initial.status === BOOKING_STATUS.UNAVAILABLE ? 'block' : 'booking')
    } else if (mode === 'add' && initial) {
      setForm({
        court_id: initial.court,
        booking_date: initial.date,
        time_slot: initial.slot.value,
        customer_name: kind === 'block' ? 'Tournament' : '',
        notes: '',
      })
      setActiveKind(kind ?? 'booking')
    }
    setFormError('')
  }, [open, mode, initial, kind])

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function switchKind(next) {
    setActiveKind(next)
    // Give the reason field a sensible default when pivoting into Block,
    // and clear it when pivoting back to a real customer booking.
    if (next === 'block' && !form.customer_name.trim()) {
      updateField('customer_name', 'Tournament')
    } else if (next === 'booking' && form.customer_name === 'Tournament') {
      updateField('customer_name', '')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.customer_name.trim()) {
      setFormError(activeKind === 'block' ? 'A reason is required.' : 'Customer name is required.')
      return
    }
    if (!form.booking_date) {
      setFormError('Pick a date.')
      return
    }

    const excludeId = mode === 'edit' ? initial?.id : undefined
    if (await isSlotTaken(Number(form.court_id), form.booking_date, form.time_slot, excludeId)) {
      setFormError(`Court ${form.court_id} is already taken for that time slot.`)
      return
    }

    setFormError('')
    const { error } = await onSave({
      ...form,
      court_id: Number(form.court_id),
      customer_name: form.customer_name.trim(),
      status: activeKind === 'block' ? BOOKING_STATUS.UNAVAILABLE : BOOKING_STATUS.BOOKED,
    })
    if (error) setFormError(error.message ?? 'Something went wrong. Please try again.')
  }

  const isBlock = activeKind === 'block'
  const isEdit = mode === 'edit'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? (isBlock ? 'Edit block' : 'Edit booking') : isBlock ? 'Block time slot' : 'New booking'}
      description={
        isEdit
          ? isBlock
            ? 'Update this blocked slot.'
            : 'Update the reservation details below.'
          : isBlock
            ? 'Close a slot off from bookings — tournaments, maintenance, etc.'
            : 'Reserve a court for a customer.'
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!isEdit && (
          <div className="flex rounded-xl border border-court-line bg-court-cream p-1">
            <button
              type="button"
              onClick={() => switchKind('booking')}
              aria-pressed={!isBlock}
              className={`flex-1 cursor-pointer rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                !isBlock ? 'bg-white text-court-forest shadow-card' : 'text-court-ink-soft hover:text-court-ink'
              }`}
            >
              Customer booking
            </button>
            <button
              type="button"
              onClick={() => switchKind('block')}
              aria-pressed={isBlock}
              className={`flex-1 cursor-pointer rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                isBlock ? 'bg-white text-status-unavailable shadow-card' : 'text-court-ink-soft hover:text-court-ink'
              }`}
            >
              Block / unavailable
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-court-ink">
            Court
            <select
              value={form.court_id}
              onChange={(e) => updateField('court_id', e.target.value)}
              className="cursor-pointer rounded-lg border border-court-line bg-white px-3 py-2 text-sm outline-none focus:border-court-forest"
            >
              {COURTS.map((c) => (
                <option key={c} value={c}>
                  Court {c}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-court-ink">
            Time slot
            <select
              value={form.time_slot}
              onChange={(e) => updateField('time_slot', e.target.value)}
              className="cursor-pointer rounded-lg border border-court-line bg-white px-3 py-2 text-sm outline-none focus:border-court-forest"
            >
              {TIME_SLOTS.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.rangeLabel}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-court-ink">
          Date
          <input
            type="date"
            value={form.booking_date}
            onChange={(e) => updateField('booking_date', e.target.value)}
            required
            className="rounded-lg border border-court-line bg-white px-3 py-2 text-sm outline-none focus:border-court-forest"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-court-ink">
          {isBlock ? 'Reason' : 'Customer name'}
          <input
            type="text"
            value={form.customer_name}
            onChange={(e) => updateField('customer_name', e.target.value)}
            placeholder={isBlock ? 'e.g. Tournament, Maintenance' : 'e.g. Maria Santos'}
            required
            className="rounded-lg border border-court-line bg-white px-3 py-2 text-sm outline-none focus:border-court-forest"
          />
        </label>

        {!isBlock && (
          <label className="flex flex-col gap-1.5 text-sm font-medium text-court-ink">
            Notes <span className="font-normal text-court-ink-soft">(optional)</span>
            <textarea
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={2}
              placeholder="Paddle rental, group size, etc."
              className="resize-none rounded-lg border border-court-line bg-white px-3 py-2 text-sm outline-none focus:border-court-forest"
            />
          </label>
        )}

        {formError && (
          <p role="alert" className="text-sm font-medium text-status-danger">
            {formError}
          </p>
        )}

        <div className="mt-1 flex items-center gap-3">
          {isEdit && (
            <button
              type="button"
              onClick={() => onRequestCancel(initial)}
              className="cursor-pointer rounded-xl border border-status-danger/30 px-4 py-2.5 text-sm font-semibold text-status-danger transition-colors hover:bg-status-danger-soft"
            >
              {isBlock ? 'Remove block' : 'Cancel booking'}
            </button>
          )}
          <div className="ml-auto flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-court-line px-4 py-2.5 text-sm font-medium text-court-ink transition-colors hover:bg-court-cream"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-colors disabled:opacity-60 ${
                isBlock ? 'bg-status-unavailable hover:bg-status-unavailable/90' : 'bg-court-forest hover:bg-court-forest/90'
              }`}
            >
              {saving ? 'Saving…' : isEdit ? 'Save changes' : isBlock ? 'Block slot' : 'Confirm booking'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
