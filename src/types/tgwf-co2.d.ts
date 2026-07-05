// Minimal ambient types for the subset of CO2.js we use.
// The package ships no type declarations (as of v0.16).
declare module '@tgwf/co2' {
  interface Co2Options {
    model?: 'swd' | '1byte'
    version?: number
  }

  export class co2 {
    constructor(options?: Co2Options)
    /** Grams of CO₂ for the given transferred bytes; `green` lowers grid intensity. */
    perByte(bytes: number, green?: boolean): number
    /** Grams of CO₂ for a visit, accounting for caching/return-visit assumptions. */
    perVisit?(bytes: number, green?: boolean): number
  }
}
