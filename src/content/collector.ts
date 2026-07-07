import type { RawCollectorResult } from '@/core/types'

/**
 * Runs in the page's context via chrome.scripting.executeScript({ func }).
 *
 * IMPORTANT: this function is serialized and injected, so it must be fully
 * self-contained — no imports, no references to module/outer scope. It may only
 * use browser globals and must return a JSON-serializable value.
 */
export function collectPageResources(): RawCollectorResult {
  const resources = performance.getEntriesByType('resource').map((e) => {
    const r = e as PerformanceResourceTiming
    return {
      url: r.name,
      initiatorType: r.initiatorType,
      transferSize: r.transferSize ?? 0,
      encodedBodySize: r.encodedBodySize ?? 0,
      decodedBodySize: r.decodedBodySize ?? 0,
    }
  })

  const navEntry = performance.getEntriesByType('navigation')[0] as
    PerformanceNavigationTiming | undefined

  const navigation = navEntry
    ? {
        transferSize: navEntry.transferSize ?? 0,
        encodedBodySize: navEntry.encodedBodySize ?? 0,
        decodedBodySize: navEntry.decodedBodySize ?? 0,
      }
    : null

  const autoplayVideoCount = document.querySelectorAll('video[autoplay]').length

  return {
    pageUrl: location.href,
    navigation,
    resources,
    autoplayVideoCount,
    collectedAt: Date.now(),
  }
}
