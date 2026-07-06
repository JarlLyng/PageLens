import { useEffect, useState } from 'react'
import { useAnalysis } from './hooks/useAnalysis'
import { EcoScoreCard } from './components/EcoScoreCard'
import { CarbonEstimateCard } from './components/CarbonEstimateCard'
import { HostingBadge } from './components/HostingBadge'
import { WeightBreakdownView } from './components/WeightBreakdown'
import { Recommendations } from './components/Recommendations'
import { Methodology } from './components/Methodology'
import { ScanModeBar } from './components/ScanModeBar'
import { setMonthlyVisits } from '@/lib/settings'

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

function LoadingSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4">
      <div className="h-20 rounded-ij-md bg-ij-muted" />
      <div className="h-16 rounded-ij-md bg-ij-muted" />
      <div className="h-24 rounded-ij-md bg-ij-muted" />
    </div>
  )
}

export function App() {
  const { state, runDeepScan } = useAnalysis()
  const [visits, setVisits] = useState<number | null>(null)

  // Seed the visits control from the analyzed snapshot once it arrives.
  useEffect(() => {
    if (state.status === 'ready') setVisits(state.snapshot.carbon.monthlyVisits)
  }, [state])

  function handleVisitsChange(next: number) {
    setVisits(next)
    void setMonthlyVisits(next)
  }

  return (
    <main className="flex flex-col gap-4 bg-ij-bg p-4 font-sans text-ij-text">
      <header className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-ij-sm bg-ij-primary font-bold text-ij-on-primary">
          P
        </span>
        <h1 className="text-base font-semibold">PageLens</h1>
      </header>

      {state.status === 'loading' && (
        <>
          {state.detail && (
            <p className="text-center text-xs text-ij-text-secondary">
              {state.detail}
            </p>
          )}
          <LoadingSkeleton />
        </>
      )}

      {state.status === 'error' && (
        <p className="rounded-ij-md border border-ij-border bg-ij-card p-3 text-sm text-ij-error">
          {state.message}
        </p>
      )}

      {state.status === 'ready' && (
        <>
          <p
            className="truncate text-xs text-ij-text-secondary"
            title={state.snapshot.pageUrl}
          >
            {hostnameOf(state.snapshot.pageUrl)}
          </p>
          <ScanModeBar
            scanMode={state.snapshot.scanMode}
            coverage={state.snapshot.coverage}
            onDeepScan={__STORE_BUILD__ ? undefined : runDeepScan}
          />
          <EcoScoreCard score={state.snapshot.score} />
          <CarbonEstimateCard
            gramsPerView={state.snapshot.carbon.gramsPerView}
            monthlyVisits={visits ?? state.snapshot.carbon.monthlyVisits}
            onVisitsChange={handleVisitsChange}
          />
          <HostingBadge hosting={state.snapshot.hosting} />
          <WeightBreakdownView weight={state.snapshot.weight} />
          <Recommendations items={state.snapshot.recommendations} />
          <Methodology />
        </>
      )}
    </main>
  )
}
