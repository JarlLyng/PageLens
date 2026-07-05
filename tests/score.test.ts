import { describe, expect, it } from 'vitest'
import {
  carbonSubScore,
  computeEcoScore,
  hostingSubScore,
  logScore,
  toGrade,
  weightSubScore,
} from '@/core/score'
import {
  CARBON_BEST_G,
  CARBON_WORST_G,
  WEIGHT_BEST_BYTES,
  WEIGHT_WORST_BYTES,
} from '@/core/constants'

describe('logScore', () => {
  it('clamps at the best and worst bounds', () => {
    expect(logScore(5, 10, 100)).toBe(100)
    expect(logScore(10, 10, 100)).toBe(100)
    expect(logScore(100, 10, 100)).toBe(0)
    expect(logScore(1000, 10, 100)).toBe(0)
  })

  it('is monotonically decreasing between bounds', () => {
    const a = logScore(20, 10, 100)
    const b = logScore(50, 10, 100)
    expect(a).toBeGreaterThan(b)
    expect(a).toBeLessThan(100)
    expect(b).toBeGreaterThan(0)
  })
})

describe('sub-scores at bounds', () => {
  it('carbon', () => {
    expect(carbonSubScore(CARBON_BEST_G)).toBe(100)
    expect(carbonSubScore(CARBON_WORST_G)).toBe(0)
  })
  it('weight', () => {
    expect(weightSubScore(WEIGHT_BEST_BYTES)).toBe(100)
    expect(weightSubScore(WEIGHT_WORST_BYTES)).toBe(0)
  })
  it('hosting', () => {
    expect(hostingSubScore('green')).toBe(100)
    expect(hostingSubScore('unknown')).toBe(50)
    expect(hostingSubScore('not-green')).toBe(0)
  })
})

describe('toGrade', () => {
  it('maps score bands to A–F', () => {
    expect(toGrade(95)).toBe('A')
    expect(toGrade(90)).toBe('A')
    expect(toGrade(85)).toBe('B')
    expect(toGrade(72)).toBe('C')
    expect(toGrade(61)).toBe('D')
    expect(toGrade(50)).toBe('E')
    expect(toGrade(20)).toBe('F')
  })
})

describe('computeEcoScore', () => {
  it('produces a perfect score for a tiny, green, clean page', () => {
    const result = computeEcoScore({
      gramsPerView: 0.05,
      totalBytes: 100 * 1024,
      hosting: 'green',
      bestPractices: 100,
    })
    expect(result.score).toBe(100)
    expect(result.grade).toBe('A')
  })

  it('weights sub-scores correctly (worst carbon/weight, green, clean)', () => {
    // carbon 0, weight 0, hosting 100*0.15, best 100*0.15 → 30
    const result = computeEcoScore({
      gramsPerView: CARBON_WORST_G,
      totalBytes: WEIGHT_WORST_BYTES,
      hosting: 'green',
      bestPractices: 100,
    })
    expect(result.score).toBe(30)
    expect(result.grade).toBe('F')
  })
})
