// Tier 2 deep scan via the Chrome DevTools Protocol (chrome.debugger).
//
// Attaches to the tab, starts Network + JS precise coverage, reloads so every
// resource loads from scratch, then reads exact transferred bytes and coverage.
// This is the only way to get true cross-origin byte sizes and unused-JS data —
// at the cost of the "PageLens is debugging this browser" banner, so it's an
// explicit opt-in from the popup.
//
// NOTE: the CDP path can't be unit-tested without a live browser; verify by
// loading the extension and running a deep scan. The byte/coverage math it feeds
// (core/coverage.ts, core/aggregate.ts) is covered by unit tests.

import type {
  CssRuleUsage,
  CssStyleSheet,
  RawScriptCoverage,
} from '@/core/coverage'
import type { RawCollectorResult, RawResourceEntry } from '@/core/types'

const CDP_VERSION = '1.3'
const LOAD_TIMEOUT_MS = 15_000
const SETTLE_MS = 1_500

export interface DeepScanRaw {
  raw: RawCollectorResult
  scripts: RawScriptCoverage[]
  cssRules: CssRuleUsage[]
  cssSheets: CssStyleSheet[]
}

interface ResponseMeta {
  url: string
  type: string
}

function sendCommand<T = unknown>(
  target: chrome.debugger.Debuggee,
  method: string,
  params?: Record<string, unknown>,
): Promise<T> {
  return chrome.debugger.sendCommand(
    target,
    method,
    params,
  ) as unknown as Promise<T>
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// CDP resource type → a PerformanceResourceTiming-style initiatorType so the
// existing classifier (extension-first, initiatorType fallback) works unchanged.
function cdpTypeToInitiator(type: string): string {
  switch (type) {
    case 'Script':
      return 'script'
    case 'Stylesheet':
      return 'css'
    case 'Image':
      return 'img'
    case 'Font':
      return 'font'
    case 'Media':
      return 'video'
    default:
      return type.toLowerCase()
  }
}

function waitForLoad(tabId: number): Promise<void> {
  return new Promise((resolve) => {
    const handler = (source: chrome.debugger.Debuggee, method: string) => {
      if (source.tabId === tabId && method === 'Page.loadEventFired') {
        chrome.debugger.onEvent.removeListener(handler)
        resolve()
      }
    }
    chrome.debugger.onEvent.addListener(handler)
    setTimeout(() => {
      chrome.debugger.onEvent.removeListener(handler)
      resolve()
    }, LOAD_TIMEOUT_MS)
  })
}

export async function runDeepScan(tabId: number): Promise<DeepScanRaw> {
  const target: chrome.debugger.Debuggee = { tabId }

  const responses = new Map<string, ResponseMeta>()
  const finishedBytes = new Map<string, number>()
  const cssSheets = new Map<string, CssStyleSheet>()
  let mainDocRequestId: string | null = null
  let mainDocUrl = ''

  const onEvent = (
    source: chrome.debugger.Debuggee,
    method: string,
    params?: unknown,
  ) => {
    if (source.tabId !== tabId) return
    const p = params as {
      requestId?: string
      type?: string
      response?: { url: string }
      encodedDataLength?: number
      header?: { styleSheetId: string; sourceURL?: string; length?: number }
    }
    if (method === 'Network.responseReceived' && p.requestId && p.response) {
      responses.set(p.requestId, { url: p.response.url, type: p.type ?? '' })
      if (p.type === 'Document' && !mainDocRequestId) {
        mainDocRequestId = p.requestId
        mainDocUrl = p.response.url
      }
    } else if (method === 'Network.loadingFinished' && p.requestId) {
      finishedBytes.set(p.requestId, p.encodedDataLength ?? 0)
    } else if (method === 'CSS.styleSheetAdded' && p.header) {
      cssSheets.set(p.header.styleSheetId, {
        styleSheetId: p.header.styleSheetId,
        url: p.header.sourceURL ?? '',
        length: p.header.length ?? 0,
      })
    }
  }

  await chrome.debugger.attach(target, CDP_VERSION)
  chrome.debugger.onEvent.addListener(onEvent)

  try {
    await sendCommand(target, 'Network.enable')
    await sendCommand(target, 'Page.enable')
    await sendCommand(target, 'Profiler.enable')
    await sendCommand(target, 'Profiler.startPreciseCoverage', {
      callCount: false,
      detailed: true,
    })
    // CSS coverage — the CSS domain requires DOM to be enabled first.
    await sendCommand(target, 'DOM.enable')
    await sendCommand(target, 'CSS.enable')
    await sendCommand(target, 'CSS.startRuleUsageTracking')

    const loaded = waitForLoad(tabId)
    await sendCommand(target, 'Page.reload', { ignoreCache: true })
    await loaded
    await delay(SETTLE_MS) // let late/async resources finish

    const coverage = await sendCommand<{ result: RawScriptCoverage[] }>(
      target,
      'Profiler.takePreciseCoverage',
    )
    await sendCommand(target, 'Profiler.stopPreciseCoverage')

    const cssCoverage = await sendCommand<{ ruleUsage: CssRuleUsage[] }>(
      target,
      'CSS.stopRuleUsageTracking',
    )

    // Fetch final URL + autoplay count from the page.
    const evaluated = await sendCommand<{
      result?: { value?: { url: string; autoplay: number } }
    }>(target, 'Runtime.evaluate', {
      expression:
        "({ url: location.href, autoplay: document.querySelectorAll('video[autoplay]').length })",
      returnByValue: true,
    })
    const pageInfo = evaluated.result?.value ?? { url: mainDocUrl, autoplay: 0 }

    const resources: RawResourceEntry[] = []
    let navBytes = 0
    for (const [requestId, meta] of responses) {
      const bytes = finishedBytes.get(requestId) ?? 0
      if (requestId === mainDocRequestId) {
        navBytes = bytes
        continue
      }
      resources.push({
        url: meta.url,
        initiatorType: cdpTypeToInitiator(meta.type),
        // Exact transferred bytes — no estimation needed.
        transferSize: bytes,
        encodedBodySize: bytes,
        decodedBodySize: bytes,
      })
    }

    const raw: RawCollectorResult = {
      pageUrl: pageInfo.url || mainDocUrl,
      navigation: {
        transferSize: navBytes,
        encodedBodySize: navBytes,
        decodedBodySize: navBytes,
      },
      resources,
      autoplayVideoCount: pageInfo.autoplay ?? 0,
      collectedAt: Date.now(),
    }

    return {
      raw,
      scripts: coverage.result ?? [],
      cssRules: cssCoverage.ruleUsage ?? [],
      cssSheets: Array.from(cssSheets.values()),
    }
  } finally {
    chrome.debugger.onEvent.removeListener(onEvent)
    try {
      await chrome.debugger.detach(target)
    } catch {
      /* already detached (e.g. tab closed) — ignore */
    }
  }
}
