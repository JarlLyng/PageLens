import {
  BEST_PRACTICE_DEDUCTIONS,
  FONT_COUNT_LIMIT,
  LARGE_CSS_TOTAL_BYTES,
  LARGE_FONT_TOTAL_BYTES,
  LARGE_GIF_BYTES,
  LARGE_JS_TOTAL_BYTES,
  OVERSIZED_IMAGE_BYTES,
  THIRD_PARTY_SCRIPT_LIMIT,
  UNUSED_CSS_MIN_BYTES,
  UNUSED_CSS_MIN_RATIO,
  UNUSED_JS_HIGH_RATIO,
  UNUSED_JS_MIN_BYTES,
  UNUSED_JS_MIN_RATIO,
} from './constants'
import { formatBytes } from './format'
import type {
  ClassifiedResource,
  CoverageSummary,
  Recommendation,
  RecommendationImpact,
  WeightBreakdown,
} from './types'

export interface RuleInput {
  weight: WeightBreakdown
  resources: ClassifiedResource[]
  autoplayVideoCount: number
  /** Only present for deep (CDP) scans. */
  coverage?: CoverageSummary | null
}

type Rule = (input: RuleInput) => Recommendation | null

const IMPACT_RANK: Record<RecommendationImpact, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

const isGif = (url: string) => /\.gif(?:$|\?)/i.test(url)

const oversizedImages: Rule = ({ resources }) => {
  const big = resources
    .filter((r) => r.category === 'image' && !isGif(r.url) && r.bytes > OVERSIZED_IMAGE_BYTES)
    .sort((a, b) => b.bytes - a.bytes)
  if (big.length === 0) return null
  return {
    id: 'oversized-images',
    impact: 'high',
    category: 'image',
    title: 'Compress oversized images',
    detail: `${big.length} image${big.length > 1 ? 's' : ''} exceed ${formatBytes(
      OVERSIZED_IMAGE_BYTES,
    )} (largest ${formatBytes(big[0].bytes)}). Compress, resize, and serve modern formats (WebP/AVIF).`,
    savingBytes: big.reduce((sum, r) => sum + r.bytes - OVERSIZED_IMAGE_BYTES, 0),
  }
}

const animatedGif: Rule = ({ resources }) => {
  const gifs = resources
    .filter((r) => isGif(r.url) && r.bytes > LARGE_GIF_BYTES)
    .sort((a, b) => b.bytes - a.bytes)
  if (gifs.length === 0) return null
  return {
    id: 'animated-gif',
    impact: 'high',
    category: 'image',
    title: 'Replace animated GIF with video',
    detail: `${gifs.length} large GIF${gifs.length > 1 ? 's' : ''} (largest ${formatBytes(
      gifs[0].bytes,
    )}). Re-encode as MP4/WebM to cut weight by ~80%.`,
    savingBytes: Math.round(gifs.reduce((sum, r) => sum + r.bytes, 0) * 0.8),
  }
}

const largeJs: Rule = ({ weight }) => {
  const js = weight.byCategory.js.bytes
  if (js <= LARGE_JS_TOTAL_BYTES) return null
  return {
    id: 'large-js',
    impact: 'high',
    category: 'js',
    title: 'Reduce JavaScript',
    detail: `${formatBytes(js)} of JavaScript across ${weight.byCategory.js.count} files. Code-split, tree-shake, and remove unused scripts.`,
    savingBytes: js - LARGE_JS_TOTAL_BYTES,
  }
}

const excessiveThirdParty: Rule = ({ resources }) => {
  const thirdPartyScripts = resources.filter(
    (r) => r.thirdParty && r.category === 'js',
  )
  if (thirdPartyScripts.length <= THIRD_PARTY_SCRIPT_LIMIT) return null
  const bytes = thirdPartyScripts.reduce((sum, r) => sum + r.bytes, 0)
  return {
    id: 'excessive-third-party',
    impact: 'medium',
    category: 'js',
    title: 'Reduce third-party scripts',
    detail: `${thirdPartyScripts.length} third-party scripts (${formatBytes(
      bytes,
    )}). Audit trackers and widgets; defer or remove non-essential ones.`,
    savingBytes: bytes,
  }
}

const largeFonts: Rule = ({ weight }) => {
  const { bytes, count } = weight.byCategory.font
  if (bytes <= LARGE_FONT_TOTAL_BYTES && count <= FONT_COUNT_LIMIT) return null
  return {
    id: 'large-fonts',
    impact: 'medium',
    category: 'font',
    title: 'Trim web fonts',
    detail: `${count} font files (${formatBytes(
      bytes,
    )}). Self-host, subset to used glyphs, and prefer WOFF2.`,
    savingBytes: Math.max(0, bytes - LARGE_FONT_TOTAL_BYTES),
  }
}

const autoplayVideo: Rule = ({ autoplayVideoCount }) => {
  if (autoplayVideoCount === 0) return null
  return {
    id: 'autoplay-video',
    impact: 'medium',
    category: 'video',
    title: 'Avoid autoplaying video',
    detail: `${autoplayVideoCount} autoplaying video${
      autoplayVideoCount > 1 ? 's' : ''
    }. Autoplay forces downloads before interaction — require a click or use a poster image.`,
  }
}

const unusedJavaScript: Rule = ({ coverage }) => {
  if (!coverage || coverage.totalJsBytes === 0) return null
  if (
    coverage.unusedRatio < UNUSED_JS_MIN_RATIO ||
    coverage.unusedJsBytes < UNUSED_JS_MIN_BYTES
  ) {
    return null
  }
  return {
    id: 'unused-js',
    impact: coverage.unusedRatio >= UNUSED_JS_HIGH_RATIO ? 'high' : 'medium',
    category: 'js',
    title: 'Remove unused JavaScript',
    detail: `~${Math.round(coverage.unusedRatio * 100)}% of JavaScript went unused on load (${formatBytes(
      coverage.unusedJsBytes,
    )}). Code-split, lazy-load, and drop dead code.`,
    savingBytes: coverage.unusedJsBytes,
  }
}

const unusedCss: Rule = ({ coverage }) => {
  if (!coverage || coverage.totalCssBytes === 0) return null
  if (
    coverage.cssUnusedRatio < UNUSED_CSS_MIN_RATIO ||
    coverage.unusedCssBytes < UNUSED_CSS_MIN_BYTES
  ) {
    return null
  }
  return {
    id: 'unused-css',
    impact: 'medium',
    category: 'css',
    title: 'Remove unused CSS',
    detail: `~${Math.round(coverage.cssUnusedRatio * 100)}% of CSS went unused on load (${formatBytes(
      coverage.unusedCssBytes,
    )}). Purge unused rules and split critical CSS.`,
    savingBytes: coverage.unusedCssBytes,
  }
}

const largeCss: Rule = ({ weight }) => {
  const css = weight.byCategory.css.bytes
  if (css <= LARGE_CSS_TOTAL_BYTES) return null
  return {
    id: 'large-css',
    impact: 'low',
    category: 'css',
    title: 'Reduce CSS',
    detail: `${formatBytes(css)} of CSS across ${weight.byCategory.css.count} files. Purge unused rules and inline only critical CSS.`,
    savingBytes: css - LARGE_CSS_TOTAL_BYTES,
  }
}

const RULES: Rule[] = [
  oversizedImages,
  animatedGif,
  largeJs,
  unusedJavaScript,
  excessiveThirdParty,
  largeFonts,
  autoplayVideo,
  unusedCss,
  largeCss,
]

/** Run every rule and return findings, most impactful first. */
export function generateRecommendations(input: RuleInput): Recommendation[] {
  return RULES.map((rule) => rule(input))
    .filter((rec): rec is Recommendation => rec !== null)
    .sort((a, b) => {
      const byImpact = IMPACT_RANK[a.impact] - IMPACT_RANK[b.impact]
      if (byImpact !== 0) return byImpact
      return (b.savingBytes ?? 0) - (a.savingBytes ?? 0)
    })
}

/** Derive the best-practices sub-score (0–100) from the findings. */
export function bestPracticesScore(recommendations: Recommendation[]): number {
  const penalty = recommendations.reduce(
    (sum, rec) => sum + BEST_PRACTICE_DEDUCTIONS[rec.impact],
    0,
  )
  return Math.max(0, 100 - penalty)
}
