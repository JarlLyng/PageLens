import { describe, expect, it } from 'vitest'
import {
  combineCoverage,
  scriptUsedBytes,
  summarizeCssCoverage,
  summarizeJsCoverage,
} from '@/core/coverage'

describe('scriptUsedBytes', () => {
  it('returns zero for no ranges', () => {
    expect(scriptUsedBytes([])).toEqual({ used: 0, total: 0 })
  })

  it('counts a fully-executed function as fully used', () => {
    expect(
      scriptUsedBytes([
        { ranges: [{ startOffset: 0, endOffset: 100, count: 1 }] },
      ]),
    ).toEqual({ used: 100, total: 100 })
  })

  it('counts a never-executed function as unused', () => {
    expect(
      scriptUsedBytes([
        { ranges: [{ startOffset: 0, endOffset: 100, count: 0 }] },
      ]),
    ).toEqual({ used: 0, total: 100 })
  })

  it('carves out a nested unused block via innermost-range rule', () => {
    // Outer [0,100] ran; nested [40,60] did not → 80 used of 100.
    expect(
      scriptUsedBytes([
        {
          ranges: [
            { startOffset: 0, endOffset: 100, count: 1 },
            { startOffset: 40, endOffset: 60, count: 0 },
          ],
        },
      ]),
    ).toEqual({ used: 80, total: 100 })
  })

  it('re-adds a used block nested inside an unused block', () => {
    // Outer [0,100] unused, [20,80] used, [40,60] unused → used = 60-20-(60-40)=40.
    expect(
      scriptUsedBytes([
        {
          ranges: [
            { startOffset: 0, endOffset: 100, count: 0 },
            { startOffset: 20, endOffset: 80, count: 3 },
            { startOffset: 40, endOffset: 60, count: 0 },
          ],
        },
      ]),
    ).toEqual({ used: 40, total: 100 })
  })

  it('sums across multiple functions', () => {
    expect(
      scriptUsedBytes([
        { ranges: [{ startOffset: 0, endOffset: 50, count: 1 }] },
        { ranges: [{ startOffset: 50, endOffset: 100, count: 0 }] },
      ]),
    ).toEqual({ used: 50, total: 100 })
  })
})

describe('summarizeJsCoverage', () => {
  it('aggregates http(s) scripts and skips inline/extension scripts', () => {
    const summary = summarizeJsCoverage([
      {
        scriptId: '1',
        url: 'https://x.com/app.js',
        functions: [
          { ranges: [{ startOffset: 0, endOffset: 1000, count: 1 }] },
        ],
      },
      {
        scriptId: '2',
        url: 'https://x.com/vendor.js',
        functions: [
          { ranges: [{ startOffset: 0, endOffset: 1000, count: 0 }] },
        ],
      },
      {
        scriptId: '3',
        url: '', // inline / eval — ignored
        functions: [
          { ranges: [{ startOffset: 0, endOffset: 9999, count: 0 }] },
        ],
      },
    ])
    expect(summary.totalJsBytes).toBe(2000)
    expect(summary.unusedJsBytes).toBe(1000)
    expect(summary.unusedRatio).toBeCloseTo(0.5)
  })

  it('handles the no-scripts case', () => {
    expect(summarizeJsCoverage([])).toEqual({
      unusedJsBytes: 0,
      totalJsBytes: 0,
      unusedRatio: 0,
    })
  })
})

describe('summarizeCssCoverage', () => {
  const sheets = [
    { styleSheetId: 'a', url: 'https://x.com/main.css', length: 1000 },
    { styleSheetId: 'b', url: '', length: 500 }, // inline <style> — ignored
  ]

  it('computes unused CSS from sheet length minus used rule ranges', () => {
    const summary = summarizeCssCoverage(
      [
        { styleSheetId: 'a', startOffset: 0, endOffset: 300, used: true },
        { styleSheetId: 'a', startOffset: 300, endOffset: 700, used: false },
        { styleSheetId: 'b', startOffset: 0, endOffset: 500, used: true }, // ignored sheet
      ],
      sheets,
    )
    expect(summary.totalCssBytes).toBe(1000)
    expect(summary.unusedCssBytes).toBe(700) // 1000 total − 300 used
    expect(summary.cssUnusedRatio).toBeCloseTo(0.7)
  })

  it('handles the no-stylesheets case', () => {
    expect(summarizeCssCoverage([], [])).toEqual({
      unusedCssBytes: 0,
      totalCssBytes: 0,
      cssUnusedRatio: 0,
    })
  })
})

describe('combineCoverage', () => {
  it('merges JS and CSS summaries into one object', () => {
    const combined = combineCoverage(
      [
        {
          scriptId: '1',
          url: 'https://x.com/app.js',
          functions: [
            { ranges: [{ startOffset: 0, endOffset: 100, count: 0 }] },
          ],
        },
      ],
      [{ styleSheetId: 'a', startOffset: 0, endOffset: 50, used: true }],
      [{ styleSheetId: 'a', url: 'https://x.com/a.css', length: 200 }],
    )
    expect(combined.unusedJsBytes).toBe(100)
    expect(combined.totalCssBytes).toBe(200)
    expect(combined.unusedCssBytes).toBe(150)
  })
})
