import { describe, expect, it } from 'vitest'
import { aggregateWeight } from '@/core/aggregate'
import type { RawCollectorResult } from '@/core/types'

const raw: RawCollectorResult = {
  pageUrl: 'https://example.com/',
  collectedAt: 0,
  autoplayVideoCount: 1,
  navigation: {
    transferSize: 10_000,
    encodedBodySize: 9_000,
    decodedBodySize: 40_000,
  },
  resources: [
    {
      url: 'https://example.com/app.js',
      initiatorType: 'script',
      transferSize: 50_000,
      encodedBodySize: 48_000,
      decodedBodySize: 120_000,
    },
    {
      url: 'https://example.com/style.css',
      initiatorType: 'link',
      transferSize: 8_000,
      encodedBodySize: 7_000,
      decodedBodySize: 30_000,
    },
    // Cross-origin image with no transferSize → estimated from encodedBodySize.
    {
      url: 'https://cdn.other.com/hero.jpg',
      initiatorType: 'img',
      transferSize: 0,
      encodedBodySize: 200_000,
      decodedBodySize: 200_000,
    },
  ],
}

describe('aggregateWeight', () => {
  const w = aggregateWeight(raw)

  it('counts the navigation entry as HTML', () => {
    expect(w.byCategory.html).toEqual({ bytes: 10_000, count: 1 })
  })

  it('sums totals across document + resources', () => {
    expect(w.totalBytes).toBe(10_000 + 50_000 + 8_000 + 200_000)
    expect(w.resourceCount).toBe(4)
  })

  it('tracks third-party bytes separately', () => {
    expect(w.thirdParty).toEqual({ bytes: 200_000, count: 1 })
  })

  it('reports estimated bytes for cross-origin resources', () => {
    expect(w.estimatedBytes).toBe(200_000)
  })

  it('categorizes js and css', () => {
    expect(w.byCategory.js.bytes).toBe(50_000)
    expect(w.byCategory.css.bytes).toBe(8_000)
    expect(w.byCategory.image.bytes).toBe(200_000)
  })
})
