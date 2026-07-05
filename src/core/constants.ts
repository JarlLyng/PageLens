// Tunable thresholds and weights for scoring. Anchored to HTTP Archive medians
// (~2.2 MB desktop) so a "typical" page lands around a C. Adjust here after
// calibrating against real sites.

/** Carbon per view (grams): score 100 at/under best, 0 at/over worst. */
export const CARBON_BEST_G = 0.1
export const CARBON_WORST_G = 3.0

/** Total transferred bytes: score 100 at/under best, 0 at/over worst. */
export const WEIGHT_BEST_BYTES = 500 * 1024 // 500 KB
export const WEIGHT_WORST_BYTES = 5 * 1024 * 1024 // 5 MB

/** Sub-score weights — must sum to 1. */
export const SCORE_WEIGHTS = {
  carbon: 0.4,
  weight: 0.3,
  hosting: 0.15,
  bestPractices: 0.15,
} as const

/** Default assumed traffic for the yearly carbon projection. */
export const DEFAULT_MONTHLY_VISITS = 10_000

/** Green Web Foundation greencheck cache lifetime. */
export const GWF_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

// --- Recommendation rule thresholds ---
export const OVERSIZED_IMAGE_BYTES = 500 * 1024 // single image
export const LARGE_GIF_BYTES = 500 * 1024 // animated GIF candidate
export const LARGE_JS_TOTAL_BYTES = 1024 * 1024 // 1 MB of JS
export const THIRD_PARTY_SCRIPT_LIMIT = 10
export const LARGE_FONT_TOTAL_BYTES = 300 * 1024
export const FONT_COUNT_LIMIT = 4
export const LARGE_CSS_TOTAL_BYTES = 150 * 1024
export const UNUSED_JS_MIN_BYTES = 100 * 1024 // only flag if this much is unused
export const UNUSED_JS_MIN_RATIO = 0.4 // ...and at least this share
export const UNUSED_JS_HIGH_RATIO = 0.6 // escalate to high impact above this
export const UNUSED_CSS_MIN_BYTES = 30 * 1024
export const UNUSED_CSS_MIN_RATIO = 0.5

/** Best-practices sub-score deductions per finding, by impact. */
export const BEST_PRACTICE_DEDUCTIONS = {
  high: 20,
  medium: 10,
  low: 5,
} as const
