import { Smartphone, QrCode, Landmark, X } from 'lucide-react'
import { TIME_SLOTS, BOOKING_STATUS } from '../../lib/constants'
import pasay002Full from '../../assets/pasay-002-full.jpg'
import pcpcBadge from '../../assets/pcpc-badge.jpg'

const PAYMENT_ICONS = {
  gcash: Smartphone,
  qrph: QrCode,
  bank: Landmark,
}

function shortHourLabel(hour24) {
  const period = hour24 >= 12 ? 'PM' : 'AM'
  let hour12 = hour24 % 12
  if (hour12 === 0) hour12 = 12
  return `${hour12} ${period}`
}

export default function ScreenshotDayCard({ dateLabel, courts, bookingsBySlot }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-court-sand bg-court-cream p-4 shadow-card sm:p-6">

      <div className="mb-4 flex flex-col items-center gap-2 text-center">
        <div className='flex gap-3 justify-center items-center'>
          <img
          src={pasay002Full}
          alt="Pasay 0-0-2 Pickleball Court"
          className="h-14 w-auto rounded-lg object-contain sm:h-20"
        />

          <X size={18}/>
    

         <img
          src={pcpcBadge}
          alt="Pasay 0-0-2 Pickleball Court"
          className="h-14 w-auto rounded-lg object-contain sm:h-20"
        />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold text-court-ink sm:text-xl">{dateLabel}</h1>
          <p className="text-xs font-medium text-court-ink-soft">Court availability</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {courts.map((court) => {
          const slots = TIME_SLOTS.map((slot) => ({
            slot,
            booking: bookingsBySlot[`${court}-${slot.value}`] ?? null,
          }))
          const reasons = [
            ...new Set(
              slots
                .filter(({ booking }) => booking?.status === BOOKING_STATUS.UNAVAILABLE)
                .map(({ booking }) => booking.customer_name)
                .filter(Boolean)
            ),
          ]

          return (
            <div key={court}>
              <p className="mb-1.5 font-display text-sm font-bold text-court-ink">Court {court}</p>
              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
                {slots.map(({ slot, booking }) => {
                  const status = booking?.status ?? BOOKING_STATUS.VACANT
                  const isBooked = status === BOOKING_STATUS.BOOKED
                  const isUnavailable = status === BOOKING_STATUS.UNAVAILABLE
                  return (
                    <div
                      key={slot.value}
                      className={`flex flex-col items-center justify-center gap-0.5 rounded-lg py-2 text-[10px] font-bold leading-tight ${
                        isBooked
                          ? 'bg-court-forest text-court-cream'
                          : isUnavailable
                            ? 'stripe-unavailable bg-status-unavailable text-white'
                            : 'border border-court-sage/60 bg-white text-court-forest'
                      }`}
                    >
                      <span className="tabular-nums">{shortHourLabel(slot.hour)}</span>
                      <span className="text-[8px] tracking-wide">
                        {isBooked ? 'BOOKED' : isUnavailable ? 'BLOCKED' : 'VACANT'}
                      </span>
                    </div>
                  )
                })}
              </div>
              {reasons.length > 0 && (
                <p className="mt-1.5 text-[11px] font-medium text-court-ink-soft">
                  Blocked for: {reasons.join(', ')}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <div className="net-line mx-auto my-4 max-w-xs" />

      <div className="flex flex-col items-center gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-court-ink-soft">Payments accepted</p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { id: 'gcash', label: 'GCash' },
            { id: 'qrph', label: 'QRPh' },
            { id: 'bank', label: 'Bank Transfer' },
          ].map((method) => {
            const Icon = PAYMENT_ICONS[method.id]
            return (
              <span
                key={method.id}
                className="flex items-center gap-1.5 rounded-full border border-court-line bg-white px-3 py-1.5 text-xs font-semibold text-court-ink"
              >
                <Icon size={13} className="text-court-forest" />
                {method.label}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
