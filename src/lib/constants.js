
export const COURTS = [1, 2, 3]

// Operating hours: strictly 1-hour increments.
export const OPEN_HOUR = 6 // 6:00 AM
export const CLOSE_HOUR = 27 // 3:00 AM (last bookable slot)

export const TIME_SLOTS = Array.from(
  { length: CLOSE_HOUR - OPEN_HOUR },
  (_, i) => {
    const hour = OPEN_HOUR + i
    return {
      value: `${String(hour).padStart(2, '0')}:00`,
      hour,
      label: formatHourLabel(hour),
      rangeLabel: `${formatHourLabel(hour)} – ${formatHourLabel(hour + 1)}`,
    }
  }
)

export function formatHourLabel(hour24) {
  // Normalize hours beyond midnight back to 0–23
  const normalizedHour = hour24 % 24

  const period = normalizedHour >= 12 ? 'PM' : 'AM'

  let hour12 = normalizedHour % 12
  if (hour12 === 0) hour12 = 12

  return `${hour12}:00 ${period}`
}

export const BOOKING_STATUS = {
  BOOKED: 'BOOKED',
  UNAVAILABLE: 'UNAVAILABLE',
  VACANT: 'VACANT',
}

export const VIEW_MODES = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
}

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// 0 = Sunday ... 6 = Saturday (matches Date#getDay())
export const WEEKDAY_GROUPS = {
  ALL: [0, 1, 2, 3, 4, 5, 6],
  WEEKDAYS: [1, 2, 3, 4, 5],
  WEEKENDS: [0, 6],
}


export const TOURNAMENT_BLOCK_PRESET = {
  label: 'Open Play',
  weekdayStart: '18:00',
  weekdayEnd: '21:00', // last bookable slot start; blocks 6-9pm
  weekendStart: '17:00',
  weekendEnd: '21:00', // blocks 5-9pm
}

export const PAYMENT_METHODS = [
  { id: 'gcash', label: 'GCash' },
  { id: 'qrph', label: 'QRPh' },
  { id: 'bank', label: 'Bank Transfer' },
]
