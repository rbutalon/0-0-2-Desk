import { useCallback, useEffect, useState } from 'react'
import { bookingService } from '../lib/dataService'

/**
 * Loads all bookings in [from, to] (inclusive) and exposes create / update
 * / cancel actions that keep local state in sync without a full refetch,
 * so the schedule feels instant even on the LocalStorage backend.
 */
export function useBookings({ from, to }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error } = await bookingService.list({ from, to })
    if (error) setError(error)
    else {
      setBookings(data)
      setError(null)
    }
    setLoading(false)
  }, [from, to])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createBooking = useCallback(async (booking) => {
    const { data, error } = await bookingService.create(booking)
    if (!error && data) setBookings((prev) => [...prev, data])
    return { data, error }
  }, [])

  const updateBooking = useCallback(async (id, patch) => {
    const { data, error } = await bookingService.update(id, patch)
    if (!error && data) {
      setBookings((prev) => prev.map((b) => (b.id === id ? data : b)))
    }
    return { data, error }
  }, [])

  const cancelBooking = useCallback(async (id) => {
    const { error } = await bookingService.remove(id)
    if (!error) setBookings((prev) => prev.filter((b) => b.id !== id))
    return { error }
  }, [])

  /**
   * Creates many UNAVAILABLE (or BOOKED) rows in one go — used by the
   * Block Schedule tool. The batch can span outside the currently loaded
   * [from, to] window, so we simply refetch afterward instead of trying
   * to merge partial results into local state.
   */
  const bulkBlock = useCallback(async (payloads) => {
    const result = await bookingService.bulkCreate(payloads)
    await refresh()
    return result
  }, [refresh])

  return { bookings, loading, error, refresh, createBooking, updateBooking, cancelBooking, bulkBlock }
}
