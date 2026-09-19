import { getDomain } from 'tldts'
import type {
  ClassifiedResource,
  RawCollectorResult,
  RawResourceEntry,
  ResourceCategory,
} from './types'

// Extension-based detection is more reliable than initiatorType (e.g. fonts and
// images pulled in by CSS both report initiatorType "css"), so we try it first.
const EXTENSION_CATEGORY: Array<[RegExp, ResourceCategory]> = [
  [/\.(?:css)(?:$|\?)/i, 'css'],
  [/\.(?:m?js|cjs)(?:$|\?)/i, 'js'],
  [/\.(?:jpe?g|png|gif|webp|avif|svg|ico|bmp|tiff?)(?:$|\?)/i, 'image'],
  [/\.(?:woff2?|ttf|otf|eot)(?:$|\?)/i, 'font'],
  [/\.(?:mp4|webm|ogg|ogv|mov|m4v|avi|mkv|m4s|ts)(?:$|\?)/i, 'video'],
]

const INITIATOR_CATEGORY: Record<string, ResourceCategory> = {
  script: 'js',
  css: 'css',
  link: 'css',
  img: 'image',
  image: 'image',
  imageset: 'image',
  input: 'image',
  video: 'video',
  audio: 'video',
  track: 'video',
  font: 'font',
}

/** Pick the most trustworthy byte count, falling back when transferSize is 0. */
export function resolveBytes(entry: RawResourceEntry): {
  bytes: number
  estimated: boolean
} {
  if (entry.transferSize > 0)
    return { bytes: entry.transferSize, estimated: false }
  // Cross-origin resources without Timing-Allow-Origin report transferSize 0;
  // approximate from the body sizes and mark the value as estimated.
  if (entry.encodedBodySize > 0)
    return { bytes: entry.encodedBodySize, estimated: true }
  if (entry.decodedBodySize > 0)
    return { bytes: entry.decodedBodySize, estimated: true }
  return { bytes: 0, estimated: false }
}

export function categorize(
  url: string,
  initiatorType: string,
): ResourceCategory {
  let pathname = url
  try {
    pathname = new URL(url).pathname
  } catch {
    /* data: / blob: / malformed — fall through to initiatorType */
  }
  for (const [pattern, category] of EXTENSION_CATEGORY) {
    if (pattern.test(pathname)) return category
  }
  return INITIATOR_CATEGORY[initiatorType] ?? 'other'
}

// The public suffix list has an ICANN section (com, co.uk, com.au) and a
// private one (github.io, vercel.app, netlify.app, pages.dev, blogspot.com,
// s3.amazonaws.com …). tldts ignores the private section by default, which
// collapses every site on a hosting platform into one domain: a tracker on a
// stranger's github.io then counts as the page's own.
//
// Honouring it costs something too — an organisation split across
// foo.github.io and foo-assets.github.io now sees them as separate parties.
// That is what eTLD+1 actually means, and undercounting a stranger's tracker
// as first-party is the worse error of the two: it only ever flatters the
// score, and it does so on exactly the kind of page this extension gets run
// on.
const DOMAIN_OPTIONS = { allowPrivateDomains: true } as const

/** Third-party = different registrable domain (eTLD+1) than the page. */
export function isThirdParty(resourceUrl: string, pageUrl: string): boolean {
  const pageDomain = getDomain(pageUrl, DOMAIN_OPTIONS)
  const resourceDomain = getDomain(resourceUrl, DOMAIN_OPTIONS)
  // Data/blob URLs (no domain) are inlined into the page → first-party.
  if (!resourceDomain) return false
  if (!pageDomain) return false
  return resourceDomain !== pageDomain
}

export function classifyResource(
  entry: RawResourceEntry,
  pageUrl: string,
): ClassifiedResource {
  const { bytes, estimated } = resolveBytes(entry)
  return {
    url: entry.url,
    category: categorize(entry.url, entry.initiatorType),
    bytes,
    estimated,
    thirdParty: isThirdParty(entry.url, pageUrl),
  }
}

/** Classify every fetched resource (excludes the main HTML document). */
export function classifyResources(
  raw: RawCollectorResult,
): ClassifiedResource[] {
  return raw.resources.map((entry) => classifyResource(entry, raw.pageUrl))
}
