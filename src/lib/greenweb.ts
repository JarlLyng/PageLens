import { GWF_CACHE_TTL_MS } from '@/core/constants'
import type { HostingResult } from '@/core/types'

const GREENCHECK_URL =
  'https://api.thegreenwebfoundation.org/api/v3/greencheck/'

interface GreencheckResponse {
  green: boolean
  hosted_by?: string | null
}

interface CacheEntry {
  status: HostingResult['status']
  hostedBy: string | null
  checkedAt: number
}

function cacheKey(hostname: string): string {
  return `gwf:${hostname}`
}

async function readCache(hostname: string): Promise<CacheEntry | null> {
  const key = cacheKey(hostname)
  const stored = await chrome.storage.local.get(key)
  const entry = stored[key] as CacheEntry | undefined
  if (!entry) return null
  if (Date.now() - entry.checkedAt > GWF_CACHE_TTL_MS) return null
  return entry
}

async function writeCache(hostname: string, entry: CacheEntry): Promise<void> {
  await chrome.storage.local.set({ [cacheKey(hostname)]: entry })
}

/**
 * Look up green-hosting status for a hostname, cached per host with a TTL.
 * Any network/parse failure degrades gracefully to "unknown".
 */
export async function checkGreenHosting(
  hostname: string,
): Promise<HostingResult> {
  const cached = await readCache(hostname)
  if (cached) return { status: cached.status, hostedBy: cached.hostedBy }

  try {
    const res = await fetch(GREENCHECK_URL + encodeURIComponent(hostname))
    if (!res.ok) throw new Error(`GWF responded ${res.status}`)
    const data = (await res.json()) as GreencheckResponse

    const result: HostingResult = {
      status: data.green ? 'green' : 'not-green',
      hostedBy: data.hosted_by ?? null,
    }
    await writeCache(hostname, { ...result, checkedAt: Date.now() })
    return result
  } catch (err) {
    console.warn('[PageLens] greencheck failed:', err)
    return { status: 'unknown', hostedBy: null }
  }
}
