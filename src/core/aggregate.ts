import { classifyResource, resolveBytes } from './classify'
import {
  RESOURCE_CATEGORIES,
  type RawCollectorResult,
  type WeightBreakdown,
  type CategoryWeight,
  type ResourceCategory,
} from './types'

function emptyByCategory(): Record<ResourceCategory, CategoryWeight> {
  return RESOURCE_CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = { bytes: 0, count: 0 }
      return acc
    },
    {} as Record<ResourceCategory, CategoryWeight>,
  )
}

/**
 * Turn a raw collector payload into an aggregated weight breakdown.
 * The main HTML document comes from the navigation entry (it is not listed among
 * the resource entries) and is counted under the "html" category.
 */
export function aggregateWeight(raw: RawCollectorResult): WeightBreakdown {
  const byCategory = emptyByCategory()
  const thirdParty: CategoryWeight = { bytes: 0, count: 0 }
  let totalBytes = 0
  let estimatedBytes = 0
  let resourceCount = 0

  // Main document (HTML).
  if (raw.navigation) {
    const { bytes, estimated } = resolveBytes({
      url: raw.pageUrl,
      initiatorType: 'navigation',
      ...raw.navigation,
    })
    byCategory.html.bytes += bytes
    byCategory.html.count += 1
    totalBytes += bytes
    resourceCount += 1
    if (estimated) estimatedBytes += bytes
  }

  for (const entry of raw.resources) {
    const resource = classifyResource(entry, raw.pageUrl)
    byCategory[resource.category].bytes += resource.bytes
    byCategory[resource.category].count += 1
    totalBytes += resource.bytes
    resourceCount += 1
    if (resource.estimated) estimatedBytes += resource.bytes
    if (resource.thirdParty) {
      thirdParty.bytes += resource.bytes
      thirdParty.count += 1
    }
  }

  return { totalBytes, resourceCount, byCategory, thirdParty, estimatedBytes }
}
