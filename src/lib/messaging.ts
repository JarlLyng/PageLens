import type { AnalysisSnapshot } from '@/core/types'

/** Popup → service worker request. */
export interface AnalyzeRequest {
  type: 'ANALYZE'
  tabId: number
}

/** Deep scan: attach the debugger, reload, and measure exact bytes + JS coverage. */
export interface DeepScanRequest {
  type: 'DEEP_SCAN'
  tabId: number
}

export type PageLensRequest = AnalyzeRequest | DeepScanRequest

export type PageLensResponse =
  { ok: true; data: AnalysisSnapshot } | { ok: false; error: string }

/** Typed wrapper around chrome.runtime.sendMessage for popup callers. */
export async function sendMessage(
  request: PageLensRequest,
): Promise<PageLensResponse> {
  return chrome.runtime.sendMessage(request) as Promise<PageLensResponse>
}
