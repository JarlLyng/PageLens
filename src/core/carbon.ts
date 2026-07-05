import { co2 } from '@tgwf/co2'
import type { CarbonEstimate, HostingStatus } from './types'

// Sustainable Web Design model — the current, more transparent default in CO2.js.
const MODEL_ID = 'swd'
const estimator = new co2({ model: MODEL_ID })

/**
 * Estimate carbon for one page view and project it across a year of traffic.
 *
 * Green hosting lowers grid intensity, so only a confirmed "green" status feeds
 * the greener path — "unknown" is treated conservatively as non-green.
 */
export function estimateCarbon(
  totalBytes: number,
  hosting: HostingStatus,
  monthlyVisits: number,
): CarbonEstimate {
  const isGreen = hosting === 'green'
  const gramsPerView = estimator.perByte(totalBytes, isGreen)
  return {
    gramsPerView,
    gramsPerYear: gramsPerView * monthlyVisits * 12,
    monthlyVisits,
    model: MODEL_ID,
  }
}
