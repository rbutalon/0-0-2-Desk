import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { useBookings } from '../../hooks/useBookings'
import { useToast } from '../common/Toast'
import { bookingService } from '../../lib/dataService'
import { COURTS, VIEW_MODES, BOOKING_STATUS } from '../../lib/constants'
import {
  addDays,
  addMonths,
  getWeekDates,
  getMonthGrid,
  formatDisplayDate,
  formatWeekRangeLabel,
  formatMonthLabel,
  todayISO,
} from '../../lib/dateUtils'
import ScheduleControls from './ScheduleControls'
import DayView from './DayView'
import WeekView from './WeekView'
import MonthView from './MonthView'
import ScreenshotDayCard from './ScreenshotDayCard'
import BookingModal from './BookingModal'
import BlockScheduleModal from './BlockScheduleModal'
import ConfirmDialog from '../common/ConfirmDialog'

export default function SchedulerTab({ screenshotMode, onExitScreenshotMode }) {
  const [view, setView] = useState(VIEW_MODES.DAY)
  const [anchorDate, setAnchorDate] = useState(todayISO())
  const [courtFilter, setCourtFilter] = useState('all')

  const [bookingModal, setBookingModal] = useState({ open: false, mode: 'add', kind: 'booking', initial: null })
  const [blockScheduleOpen, setBlockScheduleOpen] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState({ open: false, booking: null })
  const [saving, setSaving] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [blocking, setBlocking] = useState(false)

  const showToast = useToast()
  const courts = courtFilter === 'all' ? COURTS : [courtFilter]

  const weekDates = useMemo(() => getWeekDates(anchorDate), [anchorDate])
  const monthGrid = useMemo(() => getMonthGrid(anchorDate), [anchorDate])

  const range = useMemo(() => {
    if (view === VIEW_MODES.DAY) return { from: anchorDate, to: anchorDate }
    if (view === VIEW_MODES.WEEK) return { from: weekDates[0], to: weekDates[6] }
    return { from: monthGrid[0], to: monthGrid[monthGrid.length - 1] }
  }, [view, anchorDate, weekDates, monthGrid])

  const { bookings, loading, createBooking, updateBooking, cancelBooking, bulkBlock } = useBookings(range)

  const bookingsBySlot = useMemo(() => {
    const map = {}
    bookings.forEach((b) => {
      map[`${b.court_id}-${b.time_slot}`] = b
    })
    return map
  }, [bookings])

  const statusMap = useMemo(() => {
    const map = new Map()
    bookings.forEach((b) => map.set(`${b.court_id}-${b.booking_date}-${b.time_slot}`, b.status))
    return map
  }, [bookings])

  const dailyCounts = useMemo(() => {
    const map = new Map()
    bookings.forEach((b) => {
      if (!courts.includes(b.court_id)) return
      const entry = map.get(b.booking_date) ?? { booked: 0, blocked: 0 }
      if (b.status === BOOKING_STATUS.BOOKED) entry.booked += 1
      else if (b.status === BOOKING_STATUS.UNAVAILABLE) entry.blocked += 1
      map.set(b.booking_date, entry)
    })
    return map
  }, [bookings, courts])

  function getStatus(court, date, time) {
    return statusMap.get(`${court}-${date}-${time}`) ?? BOOKING_STATUS.VACANT
  }

  function countsForDate(date) {
    return dailyCounts.get(date) ?? { booked: 0, blocked: 0 }
  }

  async function checkSlotAvailability(court, date, time, excludeId) {
    const { data } = await bookingService.list({ from: date, to: date })
    return (data ?? []).some(
      (b) => b.court_id === court && b.time_slot === time && b.id !== excludeId
    )
  }

  function handlePrev() {
    if (view === VIEW_MODES.DAY) setAnchorDate((d) => addDays(d, -1))
    else if (view === VIEW_MODES.WEEK) setAnchorDate((d) => addDays(d, -7))
    else setAnchorDate((d) => addMonths(d, -1))
  }
  function handleNext() {
    if (view === VIEW_MODES.DAY) setAnchorDate((d) => addDays(d, 1))
    else if (view === VIEW_MODES.WEEK) setAnchorDate((d) => addDays(d, 7))
    else setAnchorDate((d) => addMonths(d, 1))
  }
  function handleToday() {
    setAnchorDate(todayISO())
  }
  function handleSelectDate(date) {
    setAnchorDate(date)
    setView(VIEW_MODES.DAY)
  }

  function openAddModal(initial) {
    setBookingModal({ open: true, mode: 'add', kind: 'booking', initial })
  }
  function openBlockModal(initial) {
    setBookingModal({ open: true, mode: 'add', kind: 'block', initial })
  }
  function openEditModal(booking) {
    if (!booking) return
    setBookingModal({ open: true, mode: 'edit', kind: booking.status === BOOKING_STATUS.UNAVAILABLE ? 'block' : 'booking', initial: booking })
  }
  function closeBookingModal() {
    setBookingModal({ open: false, mode: 'add', kind: 'booking', initial: null })
  }

  async function handleSaveBooking(payload) {
    setSaving(true)
    let result
    if (bookingModal.mode === 'edit') {
      result = await updateBooking(bookingModal.initial.id, payload)
    } else {
      result = await createBooking(payload)
    }
    setSaving(false)
    if (!result.error) {
      const isBlock = payload.status === BOOKING_STATUS.UNAVAILABLE
      showToast(
        bookingModal.mode === 'edit'
          ? isBlock
            ? 'Block updated.'
            : 'Booking updated.'
          : isBlock
            ? `Court ${payload.court_id} blocked (${payload.customer_name}).`
            : `Court ${payload.court_id} booked for ${payload.customer_name}.`,
        'success'
      )
      closeBookingModal()
    }
    return result
  }

  function requestCancel(booking) {
    if (!booking) return
    closeBookingModal()
    setConfirmCancel({ open: true, booking })
  }

  async function confirmCancelBooking() {
    setCancelling(true)
    const { error } = await cancelBooking(confirmCancel.booking.id)
    setCancelling(false)
    const isBlock = confirmCancel.booking?.status === BOOKING_STATUS.UNAVAILABLE
    if (!error) {
      showToast(isBlock ? 'Block removed — slot is vacant again.' : 'Booking cancelled — slot is vacant again.', 'info')
      setConfirmCancel({ open: false, booking: null })
    } else {
      showToast(isBlock ? 'Could not remove block. Please try again.' : 'Could not cancel booking. Please try again.', 'error')
    }
  }

  async function handleBulkBlock(payloads) {
    setBlocking(true)
    const result = await bulkBlock(payloads)
    setBlocking(false)
    return result
  }

  const dateLabel =
    view === VIEW_MODES.DAY
      ? formatDisplayDate(anchorDate)
      : view === VIEW_MODES.WEEK
        ? formatWeekRangeLabel(anchorDate)
        : formatMonthLabel(anchorDate)

  const isScreenshotDay = screenshotMode && view === VIEW_MODES.DAY

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {screenshotMode && (
        <button
          type="button"
          onClick={onExitScreenshotMode}
          className="mb-4 flex cursor-pointer items-center gap-1.5 rounded-full border border-court-forest/30 bg-white px-3.5 py-1.5 text-xs font-semibold text-court-forest shadow-card transition-colors hover:bg-court-forest hover:text-white"
        >
          <X size={13} />
          Exit screenshot mode
        </button>
      )}

      {!screenshotMode && (
        <div className="mb-5">
          <ScheduleControls
            courtFilter={courtFilter}
            onCourtFilterChange={setCourtFilter}
            view={view}
            onViewChange={setView}
            onPrev={handlePrev}
            onNext={handleNext}
            onToday={handleToday}
            onNewBooking={() =>
              openAddModal({
                court: courtFilter === 'all' ? COURTS[0] : courtFilter,
                date: anchorDate < todayISO() ? todayISO() : anchorDate,
                slot: { value: '06:00' },
              })
            }
            onBlockSchedule={() => setBlockScheduleOpen(true)}
          />
        </div>
      )}

      {loading ? (
        <ScheduleSkeleton view={view} courtCount={courts.length} />
      ) : isScreenshotDay ? (
        <ScreenshotDayCard dateLabel={dateLabel} courts={courts} bookingsBySlot={bookingsBySlot} />
      ) : (
        <div className={screenshotMode ? 'rounded-2xl border border-court-sand bg-court-cream p-4 shadow-card sm:p-6' : ''}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-bold text-court-ink sm:text-2xl">{dateLabel}</h1>
              <p className="text-sm text-court-ink-soft">
                {courtFilter === 'all' ? 'All courts' : `Court ${courtFilter}`}
              </p>
            </div>
          </div>

          {view === VIEW_MODES.DAY ? (
            <DayView
              date={anchorDate}
              courts={courts}
              bookingsBySlot={bookingsBySlot}
              onAdd={openAddModal}
              onEdit={openEditModal}
              onCancel={requestCancel}
              onBlock={openBlockModal}
            />
          ) : view === VIEW_MODES.WEEK ? (
            <WeekView
              weekDates={weekDates}
              courts={courts}
              getStatus={getStatus}
              onSelectDate={handleSelectDate}
              screenshotMode={screenshotMode}
            />
          ) : (
            <MonthView
              monthAnchor={anchorDate}
              courts={courts}
              countsForDate={countsForDate}
              onSelectDate={handleSelectDate}
            />
          )}
        </div>
      )}

      <BookingModal
        open={bookingModal.open}
        mode={bookingModal.mode}
        kind={bookingModal.kind}
        initial={bookingModal.initial}
        onClose={closeBookingModal}
        onSave={handleSaveBooking}
        onRequestCancel={requestCancel}
        isSlotTaken={checkSlotAvailability}
        saving={saving}
      />

      <BlockScheduleModal
        open={blockScheduleOpen}
        onClose={() => setBlockScheduleOpen(false)}
        onBlock={handleBulkBlock}
        saving={blocking}
      />

      <ConfirmDialog
        open={confirmCancel.open}
        onClose={() => setConfirmCancel({ open: false, booking: null })}
        onConfirm={confirmCancelBooking}
        title={confirmCancel.booking?.status === BOOKING_STATUS.UNAVAILABLE ? 'Remove this block?' : 'Cancel this booking?'}
        description={
          confirmCancel.booking
            ? `Court ${confirmCancel.booking.court_id} at ${confirmCancel.booking.time_slot} (${confirmCancel.booking.customer_name}) will be freed up.`
            : ''
        }
        confirmLabel={confirmCancel.booking?.status === BOOKING_STATUS.UNAVAILABLE ? 'Remove block' : 'Cancel booking'}
        loading={cancelling}
      />
    </div>
  )
}

function ScheduleSkeleton({ view, courtCount }) {
  const rows = view === VIEW_MODES.DAY ? 10 : view === VIEW_MODES.WEEK ? courtCount : 6
  return (
    <div className="animate-pulse space-y-2 rounded-2xl border border-court-line bg-white/40 p-4 shadow-card">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 rounded-lg bg-court-sand/40" />
      ))}
    </div>
  )
}
