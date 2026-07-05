import { useCallback, useEffect, useRef, useState } from 'react'
import { sendMessage } from '@/lib/messaging'
import type { AnalysisSnapshot } from '@/core/types'

export type AnalysisState =
  | { status: 'loading'; detail?: string }
  | { status: 'ready'; snapshot: AnalysisSnapshot }
  | { status: 'error'; message: string }

const UNSCRIPTABLE = /^(chrome|edge|about|chrome-extension|view-source|devtools):/

interface Target {
  tabId: number
  url: string
}

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>({ status: 'loading' })
  const targetRef = useRef<Target | null>(null)

  const resolveTarget = useCallback(async (): Promise<Target> => {
    if (targetRef.current) return targetRef.current
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id || !tab.url) throw new Error('No active tab to analyze.')
    if (UNSCRIPTABLE.test(tab.url)) {
      throw new Error('This page can’t be analyzed (browser-internal page).')
    }
    const target = { tabId: tab.id, url: tab.url }
    targetRef.current = target
    return target
  }, [])

  const run = useCallback(
    async (mode: 'quick' | 'deep') => {
      setState({
        status: 'loading',
        detail:
          mode === 'deep' ? 'Reloading page and measuring…' : undefined,
      })
      try {
        const target = await resolveTarget()
        const response = await sendMessage({
          type: mode === 'deep' ? 'DEEP_SCAN' : 'ANALYZE',
          tabId: target.tabId,
        })
        if (!response.ok) throw new Error(response.error)
        setState({ status: 'ready', snapshot: response.data })
      } catch (err: unknown) {
        setState({
          status: 'error',
          message: err instanceof Error ? err.message : 'Analysis failed.',
        })
      }
    },
    [resolveTarget],
  )

  useEffect(() => {
    void run('quick')
  }, [run])

  const runDeepScan = useCallback(() => void run('deep'), [run])

  return { state, runDeepScan }
}
