import { DEFAULT_MONTHLY_VISITS } from '@/core/constants'

// User settings, kept on this device in storage.local. Not storage.sync: with
// Chrome sync on, that copies them to the user's Google account, and
// PRIVACY.md promises they are never uploaded.
const MONTHLY_VISITS_KEY = 'monthlyVisits'

function isValidVisits(value: unknown): value is number {
  return typeof value === 'number' && value > 0
}

export async function getMonthlyVisits(): Promise<number> {
  const stored = await chrome.storage.local.get(MONTHLY_VISITS_KEY)
  const value = stored[MONTHLY_VISITS_KEY]
  return isValidVisits(value) ? value : DEFAULT_MONTHLY_VISITS
}

export async function setMonthlyVisits(value: number): Promise<void> {
  const clamped = Math.max(1, Math.round(value))
  await chrome.storage.local.set({ [MONTHLY_VISITS_KEY]: clamped })
}

/**
 * Up to 1.2.0 the setting lived in storage.sync. Copy it to storage.local,
 * unless this device already has its own value, then delete the synced copy so
 * it no longer sits in the user's Google account.
 */
export async function migrateSettingsFromSync(): Promise<void> {
  const synced = await chrome.storage.sync.get(MONTHLY_VISITS_KEY)
  if (!(MONTHLY_VISITS_KEY in synced)) return

  const local = await chrome.storage.local.get(MONTHLY_VISITS_KEY)
  const value = synced[MONTHLY_VISITS_KEY]
  if (!(MONTHLY_VISITS_KEY in local) && isValidVisits(value)) {
    await chrome.storage.local.set({ [MONTHLY_VISITS_KEY]: value })
  }
  await chrome.storage.sync.remove(MONTHLY_VISITS_KEY)
}
