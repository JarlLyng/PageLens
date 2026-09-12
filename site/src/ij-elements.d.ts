// Type declaration for the design system's custom elements.
//
// TSX does not know about custom elements, so `<ij-footer>` fails the build
// without this. Kept in its own file rather than inline in the component,
// because it is not PageLens-specific — it would ideally ship from
// @iamjarl/design-tokens so every React consumer gets it for free.
//
// Only attributes are declared, which mirrors the component's actual API
// (observedAttributes: app, tagline, layout, links-label). React 19 can also
// set properties and attach declarative events on custom elements, but this
// component has no property or event API, so attributes remain the whole
// surface.
//
// The augmentation targets `react`, not the global scope: @types/react 19
// moved JSX out of the global namespace into React.JSX, so a `declare global`
// block here would compile but never be consulted.
import type { DetailedHTMLProps, HTMLAttributes } from 'react'

// Injected by Vite `define` from the design system's pre-rendered cross-link
// fragment — see readCrossLinks() in vite.config.ts. Declared as a global
// const rather than imported so the value is inlined at build time and there
// is nothing to parse at runtime, matching the __STORE_BUILD__ flag the
// extension build uses.
declare global {
  const __IJ_CROSS_LINKS__: ReadonlyArray<{ href: string; label: string }>
}

type IjFooterProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  app?: string
  tagline?: string
  layout?: 'stacked' | 'columns'
  'links-label'?: string
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'ij-footer': IjFooterProps
    }
  }
}
