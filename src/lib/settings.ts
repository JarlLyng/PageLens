import { DEFAULT_MONTHLY_VISITS } from '@/core/constants'

// User settings, synced across the user's Chrome profiles via storage.sync.
const MONTHLY_VISITS_KEY = 'monthlyVisits'

export async function getMonthlyVisits(): Promise<number> {
  const stored = await chrome.storage.sync.get(MONTHLY_VISITS_KEY)
  const value = stored[MONTHLY_VISITS_KEY]
  return typeof value === 'number' && value > 0 ? value : DEFAULT_MONTHLY_VISITS
}

export async function setMonthlyVisits(value: number): Promise<void> {
  const clamped = Math.max(1, Math.round(value))
  await chrome.storage.sync.set({ [MONTHLY_VISITS_KEY]: clamped })
}
