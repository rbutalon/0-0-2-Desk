import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// True only when both env vars are present and non-empty. The rest of the
// app (see src/lib/dataService.js) checks this flag once at startup to
// decide whether to talk to Supabase or fall back to LocalStorage, so
// 0-0-2 Desk is fully functional in a local demo with zero configuration.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

if (!isSupabaseConfigured && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.info(
    '[0-0-2 Desk] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — ' +
    'running on the LocalStorage data layer instead of Supabase.'
  )
}
