// Thin, defensive wrapper around window.localStorage. Every read/write is
// try/caught so a private-browsing quota error never crashes the app.

const NAMESPACE = '002-desk'

function keyFor(table) {
  return `${NAMESPACE}:${table}`
}

export function loadTable(table, seed = []) {
  try {
    const raw = window.localStorage.getItem(keyFor(table))
    if (raw === null) {
      window.localStorage.setItem(keyFor(table), JSON.stringify(seed))
      return seed
    }
    return JSON.parse(raw)
  } catch (err) {
    console.error(`[0-0-2 Desk] Failed to read "${table}" from LocalStorage`, err)
    return seed
  }
}

export function saveTable(table, rows) {
  try {
    window.localStorage.setItem(keyFor(table), JSON.stringify(rows))
    return true
  } catch (err) {
    console.error(`[0-0-2 Desk] Failed to write "${table}" to LocalStorage`, err)
    return false
  }
}

export function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}
