
import { supabase, isSupabaseConfigured } from '../supabaseClient'
import { loadTable, saveTable, generateId } from './storage'
import { BOOKING_STATUS } from './constants'

const BOOKINGS_TABLE = 'bookings'

// ---------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------

export const bookingService = {
  
  // List bookings, optionally constrained to an inclusive [from, to] ISO date range. 
   
  async list({ from, to } = {}) {
    if (isSupabaseConfigured) {
      let query = supabase.from(BOOKINGS_TABLE).select('*')
      if (from) query = query.gte('booking_date', from)
      if (to) query = query.lte('booking_date', to)
      const { data, error } = await query.order('booking_date', { ascending: true })
      return { data: data ?? [], error }
    }

    const rows = loadTable(BOOKINGS_TABLE, [])
    const filtered = rows.filter((row) => {
      if (from && row.booking_date < from) return false
      if (to && row.booking_date > to) return false
      return true
    })
    return { data: filtered, error: null }
  },

  /**
   * Creates one row. `status` defaults to BOOKED (a customer reservation).
   * Pass status: 'UNAVAILABLE' to block a slot instead (e.g. a tournament
   * hold).
   */
  async create(booking) {
    const payload = {
      court_id: booking.court_id,
      booking_date: booking.booking_date,
      time_slot: booking.time_slot,
      customer_name: booking.customer_name,
      notes: booking.notes ?? null,
      status: booking.status ?? BOOKING_STATUS.BOOKED,
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from(BOOKINGS_TABLE)
        .insert(payload)
        .select()
        .single()
      return { data, error }
    }

    const rows = loadTable(BOOKINGS_TABLE, [])
    const row = { id: generateId(), created_at: new Date().toISOString(), ...payload }
    saveTable(BOOKINGS_TABLE, [...rows, row])
    return { data: row, error: null }
  },


   // Inserts many UNAVAILABLE (or BOOKED) rows at once 
   
  async bulkCreate(bookings) {
    if (bookings.length === 0) return { data: [], skipped: 0, error: null }

    const payloads = bookings.map((b) => ({
      court_id: b.court_id,
      booking_date: b.booking_date,
      time_slot: b.time_slot,
      customer_name: b.customer_name,
      notes: b.notes ?? null,
      status: b.status ?? BOOKING_STATUS.UNAVAILABLE,
    }))

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from(BOOKINGS_TABLE)
        .upsert(payloads, {
          onConflict: 'court_id,booking_date,time_slot',
          ignoreDuplicates: true,
        })
        .select()
      if (error) return { data: [], skipped: 0, error }
      return { data: data ?? [], skipped: payloads.length - (data?.length ?? 0), error: null }
    }

    const rows = loadTable(BOOKINGS_TABLE, [])
    const occupied = new Set(rows.map((r) => `${r.court_id}-${r.booking_date}-${r.time_slot}`))
    const created = []
    for (const payload of payloads) {
      const key = `${payload.court_id}-${payload.booking_date}-${payload.time_slot}`
      if (occupied.has(key)) continue
      const row = { id: generateId(), created_at: new Date().toISOString(), ...payload }
      created.push(row)
      occupied.add(key)
    }
    saveTable(BOOKINGS_TABLE, [...rows, ...created])
    return { data: created, skipped: payloads.length - created.length, error: null }
  },

  async update(id, patch) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from(BOOKINGS_TABLE)
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    }

    const rows = loadTable(BOOKINGS_TABLE, [])
    let updated = null
    const next = rows.map((row) => {
      if (row.id !== id) return row
      updated = { ...row, ...patch }
      return updated
    })
    saveTable(BOOKINGS_TABLE, next)
    return { data: updated, error: updated ? null : new Error('Booking not found') }
  },

  /** Cancel a booking, deletes the row, which returns the slot to VACANT. */
  async remove(id) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from(BOOKINGS_TABLE).delete().eq('id', id)
      return { error }
    }

    const rows = loadTable(BOOKINGS_TABLE, [])
    saveTable(BOOKINGS_TABLE, rows.filter((row) => row.id !== id))
    return { error: null }
  },
}
