import { describe, expect, it } from 'vitest'
import {
  bestPracticesScore,
  generateRecommendations,
  type RuleInput,
} from '@/core/recommendations'
import { RESOURCE_CATEGORIES } from '@/core/types'
import type {
  CategoryWeight,
  ResourceCategory,
  WeightBreakdown,
} from '@/core/types'

function emptyWeight(
  overrides: Partial<Record<ResourceCategory, CategoryWeight>> = {},
): WeightBreakdown {
  const byCategory = RESOURCE_CATEGORIES.reduce(
    (acc, c) => {
      acc[c] = overrides[c] ?? { bytes: 0, count: 0 }
      return acc
    },
    {} as Record<ResourceCategory, CategoryWeight>,
  )
  return {
    totalBytes: 0,
    resourceCount: 0,
    byCategory,
    thirdParty: { bytes: 0, count: 0 },
    estimatedBytes: 0,
  }
}

const CLEAN: RuleInput = {
  weight: emptyWeight(),
  resources: [],
  autoplayVideoCount: 0,
}

describe('generateRecommendations', () => {
  it('returns nothing for a clean page', () => {
    expect(generateRecommendations(CLEAN)).toEqual([])
  })

  it('flags an oversized image as high impact', () => {
    const recs = generateRecommendations({
      ...CLEAN,
      resources: [
        {
          url: 'https://x.com/hero.jpg',
          category: 'image',
          bytes: 900 * 1024,
          estimated: false,
          thirdParty: false,
        },
      ],
    })
    expect(recs.map((r) => r.id)).toContain('oversized-images')
    expect(recs[0].impact).toBe('high')
  })

  it('flags a large GIF separately from regular images', () => {
    const recs = generateRecommendations({
      ...CLEAN,
      resources: [
        {
          url: 'https://x.com/loop.gif',
          category: 'image',
          bytes: 800 * 1024,
          estimated: false,
          thirdParty: false,
        },
      ],
    })
    expect(recs.map((r) => r.id)).toContain('animated-gif')
    expect(recs.map((r) => r.id)).not.toContain('oversized-images')
  })

  it('flags excessive third-party scripts', () => {
    const resources = Array.from({ length: 12 }, (_, i) => ({
      url: `https://cdn${i}.other.com/a.js`,
      category: 'js' as const,
      bytes: 10_000,
      estimated: false,
      thirdParty: true,
    }))
    const recs = generateRecommendations({ ...CLEAN, resources })
    expect(recs.map((r) => r.id)).toContain('excessive-third-party')
  })

  const noCss = { unusedCssBytes: 0, totalCssBytes: 0, cssUnusedRatio: 0 }
  const noJs = { unusedJsBytes: 0, totalJsBytes: 0, unusedRatio: 0 }

  it('flags unused JavaScript only when coverage crosses thresholds', () => {
    // Below ratio threshold → nothing.
    expect(
      generateRecommendations({
        ...CLEAN,
        coverage: {
          unusedJsBytes: 500 * 1024,
          totalJsBytes: 5 * 1024 * 1024,
          unusedRatio: 0.1,
          ...noCss,
        },
      }).map((r) => r.id),
    ).not.toContain('unused-js')

    // High ratio + enough bytes → high impact.
    const recs = generateRecommendations({
      ...CLEAN,
      coverage: {
        unusedJsBytes: 700 * 1024,
        totalJsBytes: 1024 * 1024,
        unusedRatio: 0.68,
        ...noCss,
      },
    })
    expect(recs.find((r) => r.id === 'unused-js')?.impact).toBe('high')
  })

  it('flags unused CSS when it crosses thresholds', () => {
    const recs = generateRecommendations({
      ...CLEAN,
      coverage: {
        ...noJs,
        unusedCssBytes: 80 * 1024,
        totalCssBytes: 120 * 1024,
        cssUnusedRatio: 0.67,
      },
    })
    expect(recs.find((r) => r.id === 'unused-css')?.impact).toBe('medium')
  })

  it('never flags unused JS/CSS without coverage (quick scan)', () => {
    const ids = generateRecommendations(CLEAN).map((r) => r.id)
    expect(ids).not.toContain('unused-js')
    expect(ids).not.toContain('unused-css')
  })

  it('sorts high-impact findings before lower ones', () => {
    const recs = generateRecommendations({
      weight: emptyWeight({
        js: { bytes: 2 * 1024 * 1024, count: 5 },
        css: { bytes: 200 * 1024, count: 3 },
      }),
      resources: [],
      autoplayVideoCount: 1,
    })
    const impacts = recs.map((r) => r.impact)
    // high (large-js) → medium (autoplay) → low (large-css)
    expect(impacts).toEqual(['high', 'medium', 'low'])
  })
})

describe('bestPracticesScore', () => {
  it('is 100 with no findings', () => {
    expect(bestPracticesScore([])).toBe(100)
  })

  it('deducts by impact and clamps at 0', () => {
    expect(
      bestPracticesScore([
        { id: 'a', title: '', detail: '', impact: 'high', category: 'general' },
        {
          id: 'b',
          title: '',
          detail: '',
          impact: 'medium',
          category: 'general',
        },
        { id: 'c', title: '', detail: '', impact: 'low', category: 'general' },
      ]),
    ).toBe(100 - 20 - 10 - 5)
  })
})
