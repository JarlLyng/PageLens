// PageLens background service worker (MV3).
//
// Owns the analysis pipeline. Quick scan uses the Performance API via injection;
// deep scan uses the DevTools Protocol (exact bytes + JS coverage). Both feed the
// same snapshot builder.

import { aggregateWeight } from '@/core/aggregate'
import { classifyResources } from '@/core/classify'
import { estimateCarbon } from '@/core/carbon'
import { combineCoverage } from '@/core/coverage'
import {
  bestPracticesScore,
  generateRecommendations,
} from '@/core/recommendations'
import { computeEcoScore } from '@/core/score'
import { collectPageResources } from '@/content/collector'
import { checkGreenHosting } from '@/lib/greenweb'
import { getMonthlyVisits } from '@/lib/settings'
import type {
  AnalysisSnapshot,
  CoverageSummary,
  RawCollectorResult,
  ScanMode,
} from '@/core/types'
import type { PageLensRequest, PageLensResponse } from '@/lib/messaging'

chrome.runtime.onInstalled.addListener((details) => {
  console.info('[PageLens] service worker installed:', details.reason)
})

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

/** Shared pipeline: raw capture (+ optional coverage) → full snapshot. */
async function buildSnapshot(
  raw: RawCollectorResult,
  scanMode: ScanMode,
  coverage: CoverageSummary | null,
): Promise<AnalysisSnapshot> {
  const resources = classifyResources(raw)
  const weight = aggregateWeight(raw)
  const recommendations = generateRecommendations({
    weight,
    resources,
    autoplayVideoCount: raw.autoplayVideoCount,
    coverage,
  })

  const hostname = hostnameOf(raw.pageUrl)
  const hosting = hostname
    ? await checkGreenHosting(hostname)
    : { status: 'unknown' as const, hostedBy: null }

  const monthlyVisits = await getMonthlyVisits()
  const carbon = estimateCarbon(weight.totalBytes, hosting.status, monthlyVisits)

  const score = computeEcoScore({
    gramsPerView: carbon.gramsPerView,
    totalBytes: weight.totalBytes,
    hosting: hosting.status,
    bestPractices: bestPracticesScore(recommendations),
  })

  return {
    pageUrl: raw.pageUrl,
    collectedAt: raw.collectedAt,
    scanMode,
    weight,
    autoplayVideoCount: raw.autoplayVideoCount,
    hosting,
    carbon,
    score,
    recommendations,
    coverage,
  }
}

async function quickScan(tabId: number): Promise<AnalysisSnapshot> {
  const [injection] = await chrome.scripting.executeScript({
    target: { tabId },
    func: collectPageResources,
  })
  const raw = injection?.result
  if (!raw) throw new Error('Collector returned no data for this tab.')
  return buildSnapshot(raw, 'quick', null)
}

async function deepScan(tabId: number): Promise<AnalysisSnapshot> {
  // Guarding the dynamic import with the compile-time flag makes the import()
  // unreachable in the store build, so Rollup drops the deep-scan chunk (and all
  // chrome.debugger code) entirely.
  if (__STORE_BUILD__) throw new Error('Deep scan is not available in this build.')
  const { runDeepScan } = await import('./deep-scan')
  const { raw, scripts, cssRules, cssSheets } = await runDeepScan(tabId)
  return buildSnapshot(
    raw,
    'deep',
    combineCoverage(scripts, cssRules, cssSheets),
  )
}

chrome.runtime.onMessage.addListener(
  (request: PageLensRequest, _sender, sendResponse) => {
    const work =
      request.type === 'DEEP_SCAN' && !__STORE_BUILD__
        ? deepScan(request.tabId)
        : request.type === 'ANALYZE'
          ? quickScan(request.tabId)
          : null

    if (!work) return undefined

    work
      .then((data) => sendResponse({ ok: true, data } satisfies PageLensResponse))
      .catch((err: unknown) =>
        sendResponse({
          ok: false,
          error: err instanceof Error ? err.message : 'Analysis failed.',
        } satisfies PageLensResponse),
      )

    // Keep the message channel open for the async response.
    return true
  },
)
