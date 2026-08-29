// Type declaration for the design system's custom elements.
//
// TSX does not know about custom elements, so `<ij-footer>` fails the build
// without this. Kept in its own file rather than inline in the component,
// because it is not PageLens-specific — it would ideally ship from
// @iamjarl/design-tokens so every React consumer gets it for free.
//
// Only attributes are declared, which mirrors the component's actual API
// (observedAttributes: app, tagline, layout, links-label). That is also why
// this is safe in React 18: React sets attributes, not properties, on unknown
// elements — a property-based API would silently receive stringified values.
import type { DetailedHTMLProps, HTMLAttributes } from 'react'

type IjFooterProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  app?: string
  tagline?: string
  layout?: 'stacked' | 'columns'
  'links-label'?: string
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ij-footer': IjFooterProps
    }
  }
}
