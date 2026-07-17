// Tunable thresholds and weights for scoring.
//
// Calibrated against real-world data so the grade distribution is meaningful
// rather than "everything fails":
//   - Page weight: HTTP Archive median is ~2.2 MB (desktop).
//   - Carbon: computed from the CO2.js SWD model (v0.19+), which yields
//     ~0.155 g/MB, so a median 2.2 MB page is ~0.34 g (grey) / ~0.28 g (green).
//     The carbon thresholds below are re-derived whenever the model changes so
//     the grade distribution stays stable (only the displayed g figure moves).
//
// With the curves below a typical page lands mid-scale, and hosting is the
// deciding factor at the median (a real, actionable story):
//   - light + green + clean      → A
//   - light (any hosting)        → B
//   - median (2.2 MB) + green    → C
//   - median (2.2 MB) + grey     → D
//   - heavy (5–8 MB)             → E/F
//   - very heavy (10 MB+)        → F

/** Carbon per view (grams): score 100 at/under best, 0 at/over worst. */
export const CARBON_BEST_G = 0.16
export const CARBON_WORST_G = 1.9

/** Total transferred bytes: score 100 at/under best, 0 at/over worst. */
export const WEIGHT_BEST_BYTES = 1 * 1024 * 1024 // 1 MB
export const WEIGHT_WORST_BYTES = 15 * 1024 * 1024 // 15 MB

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
