import { describe, expect, it } from 'vitest'
import {
  feedbackHref,
  SUPPORT_EMAIL,
} from '../src/popup/components/FeedbackLink'

describe('feedbackHref', () => {
  it('addresses the one support inbox', () => {
    expect(feedbackHref('1.2.0').startsWith(`mailto:${SUPPORT_EMAIL}?`)).toBe(
      true,
    )
    expect(SUPPORT_EMAIL).toBe('support@iamjarl.com')
  })

  it('prefills the subject with product and version', () => {
    const url = new URL(feedbackHref('1.2.0'))
    expect(url.searchParams.get('subject')).toBe('PageLens 1.2.0 feedback')
  })

  it('encodes the subject so mail clients read it whole', () => {
    expect(feedbackHref('1.2.0')).toContain(
      'subject=PageLens%201.2.0%20feedback',
    )
  })

  // The privacy promise: only a hostname ever leaves the device. A feedback
  // link must not quietly put the page someone was on into a draft email.
  it('carries no body or page URL', () => {
    const url = new URL(feedbackHref('1.2.0'))
    expect([...url.searchParams.keys()]).toEqual(['subject'])
  })
})
