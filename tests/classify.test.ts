import { describe, expect, it } from 'vitest'
import {
  categorize,
  classifyResource,
  isThirdParty,
  resolveBytes,
} from '@/core/classify'

describe('categorize', () => {
  it('detects by file extension regardless of initiatorType', () => {
    expect(categorize('https://x.com/app.js', 'link')).toBe('js')
    expect(categorize('https://x.com/main.css', 'script')).toBe('css')
    expect(categorize('https://x.com/logo.png', 'other')).toBe('image')
    expect(categorize('https://x.com/font.woff2', 'css')).toBe('font')
    expect(categorize('https://x.com/clip.mp4', 'other')).toBe('video')
  })

  it('handles query strings on the extension', () => {
    expect(categorize('https://x.com/a.js?v=3', 'other')).toBe('js')
  })

  it('falls back to initiatorType when the extension is unknown', () => {
    expect(categorize('https://x.com/api/data', 'script')).toBe('js')
    expect(categorize('https://x.com/track', 'img')).toBe('image')
    expect(categorize('https://x.com/xhr', 'xmlhttprequest')).toBe('other')
  })
})

describe('resolveBytes', () => {
  const base = { url: 'x', initiatorType: 'script' }

  it('prefers transferSize when present', () => {
    expect(
      resolveBytes({ ...base, transferSize: 100, encodedBodySize: 90, decodedBodySize: 300 }),
    ).toEqual({ bytes: 100, estimated: false })
  })

  it('falls back to encodedBodySize and marks estimated', () => {
    expect(
      resolveBytes({ ...base, transferSize: 0, encodedBodySize: 90, decodedBodySize: 300 }),
    ).toEqual({ bytes: 90, estimated: true })
  })

  it('returns zero (not estimated) when nothing is available', () => {
    expect(
      resolveBytes({ ...base, transferSize: 0, encodedBodySize: 0, decodedBodySize: 0 }),
    ).toEqual({ bytes: 0, estimated: false })
  })
})

describe('isThirdParty', () => {
  const page = 'https://www.example.com/page'

  it('treats subdomains of the same registrable domain as first-party', () => {
    expect(isThirdParty('https://cdn.example.com/a.js', page)).toBe(false)
  })

  it('treats a different registrable domain as third-party', () => {
    expect(isThirdParty('https://googletagmanager.com/gtm.js', page)).toBe(true)
  })

  it('handles multi-part public suffixes correctly', () => {
    expect(isThirdParty('https://foo.co.uk/a.js', 'https://bar.co.uk/p')).toBe(true)
    expect(isThirdParty('https://a.foo.co.uk/x.js', 'https://foo.co.uk/p')).toBe(false)
  })

  it('treats data URLs as first-party', () => {
    expect(isThirdParty('data:image/png;base64,AAAA', page)).toBe(false)
  })
})

describe('classifyResource', () => {
  it('combines category, bytes and third-party detection', () => {
    const result = classifyResource(
      {
        url: 'https://cdn.other.com/lib.js',
        initiatorType: 'script',
        transferSize: 5000,
        encodedBodySize: 4800,
        decodedBodySize: 12000,
      },
      'https://example.com/',
    )
    expect(result).toEqual({
      url: 'https://cdn.other.com/lib.js',
      category: 'js',
      bytes: 5000,
      estimated: false,
      thirdParty: true,
    })
  })
})
