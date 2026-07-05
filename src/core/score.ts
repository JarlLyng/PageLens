import {
  CARBON_BEST_G,
  CARBON_WORST_G,
  SCORE_WEIGHTS,
  WEIGHT_BEST_BYTES,
  WEIGHT_WORST_BYTES,
} from './constants'
import type {
  EcoGrade,
  EcoScore,
  HostingStatus,
  SubScores,
} from './types'

/**
 * Map a "lower is better" metric to 0–100 on a log scale.
 * Returns 100 at/under `best`, 0 at/over `worst`.
 */
export function logScore(value: number, best: number, worst: number): number {
  if (value <= best) return 100
  if (value >= worst) return 0
  const t =
    (Math.log(value) - Math.log(best)) / (Math.log(worst) - Math.log(best))
  return Math.round((1 - t) * 100)
}

export function carbonSubScore(gramsPerView: number): number {
  return logScore(gramsPerView, CARBON_BEST_G, CARBON_WORST_G)
}

export function weightSubScore(totalBytes: number): number {
  return logScore(totalBytes, WEIGHT_BEST_BYTES, WEIGHT_WORST_BYTES)
}

export function hostingSubScore(status: HostingStatus): number {
  switch (status) {
    case 'green':
      return 100
    case 'unknown':
      return 50
    case 'not-green':
      return 0
  }
}

export function toGrade(score: number): EcoGrade {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  if (score >= 50) return 'E'
  return 'F'
}

export interface ScoreInput {
  gramsPerView: number
  totalBytes: number
  hosting: HostingStatus
  /** 0–100 best-practices sub-score (from the recommendations engine; step 4). */
  bestPractices: number
}

export function computeEcoScore(input: ScoreInput): EcoScore {
  const subScores: SubScores = {
    carbon: carbonSubScore(input.gramsPerView),
    weight: weightSubScore(input.totalBytes),
    hosting: hostingSubScore(input.hosting),
    bestPractices: input.bestPractices,
  }

  const score = Math.round(
    subScores.carbon * SCORE_WEIGHTS.carbon +
      subScores.weight * SCORE_WEIGHTS.weight +
      subScores.hosting * SCORE_WEIGHTS.hosting +
      subScores.bestPractices * SCORE_WEIGHTS.bestPractices,
  )

  return { score, grade: toGrade(score), subScores }
}
