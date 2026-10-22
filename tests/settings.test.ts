import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_MONTHLY_VISITS } from '../src/core/constants'
import {
  getMonthlyVisits,
  migrateSettingsFromSync,
  setMonthlyVisits,
} from '../src/lib/settings'

/** An in-memory stand-in for one chrome.storage area. */
function fakeArea(initial: Record<string, unknown> = {}) {
  const data: Record<string, unknown> = { ...initial }
  return {
    data,
    get: vi.fn(async (key: string) =>
      key in data ? { [key]: data[key] } : {},
    ),
    set: vi.fn(async (items: Record<string, unknown>) => {
      Object.assign(data, items)
    }),
    remove: vi.fn(async (key: string) => {
      delete data[key]
    }),
  }
}

let local: ReturnType<typeof fakeArea>
let sync: ReturnType<typeof fakeArea>

function stubStorage(
  localData: Record<string, unknown> = {},
  syncData: Record<string, unknown> = {},
) {
  local = fakeArea(localData)
  sync = fakeArea(syncData)
  vi.stubGlobal('chrome', { storage: { local, sync } })
}

beforeEach(() => stubStorage())
afterEach(() => vi.unstubAllGlobals())

// The privacy promise: the setting is stored on the device and never
// uploaded. storage.sync would copy it to the user's Google account.
describe('monthly visits setting', () => {
  it('is written to storage.local, never storage.sync', async () => {
    await setMonthlyVisits(2500)
    expect(local.data.monthlyVisits).toBe(2500)
    expect(sync.set).not.toHaveBeenCalled()
  })

  it('is read from storage.local, never storage.sync', async () => {
    stubStorage({ monthlyVisits: 4200 }, { monthlyVisits: 9999 })
    expect(await getMonthlyVisits()).toBe(4200)
    expect(sync.get).not.toHaveBeenCalled()
  })

  it('falls back to the default when nothing valid is stored', async () => {
    expect(await getMonthlyVisits()).toBe(DEFAULT_MONTHLY_VISITS)
    stubStorage({ monthlyVisits: 0 })
    expect(await getMonthlyVisits()).toBe(DEFAULT_MONTHLY_VISITS)
  })

  it('rounds and clamps what it stores', async () => {
    await setMonthlyVisits(0.4)
    expect(local.data.monthlyVisits).toBe(1)
    await setMonthlyVisits(1234.6)
    expect(local.data.monthlyVisits).toBe(1235)
  })
})

describe('migrateSettingsFromSync', () => {
  it('moves a synced value to storage.local and deletes the synced copy', async () => {
    stubStorage({}, { monthlyVisits: 3000 })
    await migrateSettingsFromSync()
    expect(local.data.monthlyVisits).toBe(3000)
    expect(sync.data).not.toHaveProperty('monthlyVisits')
  })

  it('keeps a value this device already has', async () => {
    stubStorage({ monthlyVisits: 500 }, { monthlyVisits: 3000 })
    await migrateSettingsFromSync()
    expect(local.data.monthlyVisits).toBe(500)
    expect(sync.data).not.toHaveProperty('monthlyVisits')
  })

  it('deletes an invalid synced value without copying it', async () => {
    stubStorage({}, { monthlyVisits: -5 })
    await migrateSettingsFromSync()
    expect(local.data).not.toHaveProperty('monthlyVisits')
    expect(sync.data).not.toHaveProperty('monthlyVisits')
  })

  it('does nothing when there is no synced value', async () => {
    await migrateSettingsFromSync()
    expect(local.set).not.toHaveBeenCalled()
    expect(sync.remove).not.toHaveBeenCalled()
  })
})
