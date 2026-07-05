// Shared, framework-free domain types for PageLens.
// Everything in core/ is pure and unit-testable — no chrome.* or DOM access.

export type ResourceCategory =
  | 'html'
  | 'css'
  | 'js'
  | 'image'
  | 'font'
  | 'video'
  | 'other'

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  'html',
  'css',
  'js',
  'image',
  'font',
  'video',
  'other',
]

/** A single resource as reported by PerformanceResourceTiming, pre-classification. */
export interface RawResourceEntry {
  url: string
  initiatorType: string
  transferSize: number
  encodedBodySize: number
  decodedBodySize: number
}

/** Bytes for the main HTML document, from PerformanceNavigationTiming. */
export interface RawNavigationEntry {
  transferSize: number
  encodedBodySize: number
  decodedBodySize: number
}

/** Raw payload returned by the injected page collector — must be JSON-serializable. */
export interface RawCollectorResult {
  pageUrl: string
  navigation: RawNavigationEntry | null
  resources: RawResourceEntry[]
  autoplayVideoCount: number
  collectedAt: number
}

export interface ClassifiedResource {
  url: string
  category: ResourceCategory
  bytes: number
  /** True when bytes were inferred (e.g. cross-origin transferSize was 0). */
  estimated: boolean
  thirdParty: boolean
}

export interface CategoryWeight {
  bytes: number
  count: number
}

/** Aggregated page weight, the output of the capture+classify stage. */
export interface WeightBreakdown {
  totalBytes: number
  resourceCount: number
  byCategory: Record<ResourceCategory, CategoryWeight>
  thirdParty: CategoryWeight
  /** Bytes that were inferred rather than measured — drives the "estimated" UI flag. */
  estimatedBytes: number
}

export type HostingStatus = 'green' | 'unknown' | 'not-green'

export interface HostingResult {
  status: HostingStatus
  /** Provider name from the Green Web Foundation, when known. */
  hostedBy: string | null
}

export interface CarbonEstimate {
  gramsPerView: number
  gramsPerYear: number
  monthlyVisits: number
  /** Model identifier, e.g. "swd" (Sustainable Web Design). */
  model: string
}

export type EcoGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

export interface SubScores {
  carbon: number
  weight: number
  hosting: number
  bestPractices: number
}

export interface EcoScore {
  /** Overall 0–100 Eco Score. */
  score: number
  grade: EcoGrade
  subScores: SubScores
}

export type ScanMode = 'quick' | 'deep'

/** JS + CSS coverage summary, only available from a deep (CDP) scan. */
export interface CoverageSummary {
  unusedJsBytes: number
  totalJsBytes: number
  /** unusedJsBytes / totalJsBytes, 0–1. */
  unusedRatio: number
  unusedCssBytes: number
  totalCssBytes: number
  /** unusedCssBytes / totalCssBytes, 0–1. */
  cssUnusedRatio: number
}

export type RecommendationImpact = 'high' | 'medium' | 'low'

export interface Recommendation {
  id: string
  title: string
  detail: string
  impact: RecommendationImpact
  category: ResourceCategory | 'general'
  /** Rough bytes that could be saved, when estimable — used for sorting. */
  savingBytes?: number
}

/** The snapshot produced for one analysis run. */
export interface AnalysisSnapshot {
  pageUrl: string
  collectedAt: number
  scanMode: ScanMode
  weight: WeightBreakdown
  autoplayVideoCount: number
  hosting: HostingResult
  carbon: CarbonEstimate
  score: EcoScore
  recommendations: Recommendation[]
  /** Present only for deep scans. */
  coverage: CoverageSummary | null
}
