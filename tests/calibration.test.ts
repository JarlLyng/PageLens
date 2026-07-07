import { describe, expect, it } from 'vitest'
import { computeEcoScore } from '@/core/score'
import type { HostingStatus } from '@/core/types'

const MB = 1024 * 1024

// Representative real-world pages. Carbon grams come from the CO2.js SWD model
// (~0.4 g/MB grey, ~0.35 g/MB green). These assertions pin the calibration so a
// meaningful spread of grades is preserved — update deliberately if the curves
// in constants.ts change.
function grade(
  gramsPerView: number,
  mb: number,
  hosting: HostingStatus,
  bestPractices: number,
) {
  return computeEcoScore({
    gramsPerView,
    totalBytes: mb * MB,
    hosting,
    bestPractices,
  }).grade
}

describe('score calibration (representative sites)', () => {
  it('light + green + clean page → A', () => {
    expect(grade(0.28, 0.8, 'green', 100)).toBe('A')
  })

  it('light page on grey hosting → B', () => {
    expect(grade(0.32, 0.8, 'not-green', 100)).toBe('B')
  })

  it('median 2.2 MB page on green hosting → C', () => {
    expect(grade(0.77, 2.2, 'green', 80)).toBe('C')
  })

  it('median 2.2 MB page on grey hosting → D', () => {
    expect(grade(0.88, 2.2, 'not-green', 80)).toBe('D')
  })

  it('heavy 8 MB page on grey hosting → F', () => {
    expect(grade(3.21, 8, 'not-green', 50)).toBe('F')
  })

  it('a median page is no longer an automatic fail', () => {
    // Regression guard for the pre-calibration bug where a typical site got an F.
    const median = computeEcoScore({
      gramsPerView: 0.77,
      totalBytes: 2.2 * MB,
      hosting: 'green',
      bestPractices: 80,
    })
    expect(median.score).toBeGreaterThanOrEqual(70)
  })
})
