// Generates the social share (Open Graph) image and PNG favicon fallbacks by
// rasterizing SVG with @resvg/resvg-js. Run locally and commit the outputs so
// the deploy pipeline doesn't depend on fonts being present on CI.
//
// Run: npm run og   (from the site/ directory)

import { Resvg } from '@resvg/resvg-js'
import { writeFileSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(dir, '..', 'public')

const FONT = 'Arial, Helvetica, sans-serif'

// A–F grade chips, matching the extension's data-viz palette.
const GRADES = [
  ['A', '#0cce6b'],
  ['B', '#8ac926'],
  ['C', '#ffca3a'],
  ['D', '#ff924c'],
  ['E', '#ff595e'],
  ['F', '#d00000'],
]

const chips = GRADES.map(([letter, color], i) => {
  const x = 98 + i * 84
  return `
    <rect x="${x}" y="430" width="70" height="46" rx="10" fill="${color}" />
    <text x="${x + 35}" y="462" font-family="${FONT}" font-size="28" font-weight="700"
          fill="#0f0f14" text-anchor="middle">${letter}</text>`
}).join('')

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0f0f14" />
  <circle cx="1050" cy="120" r="280" fill="#A435D2" opacity="0.18" />
  <circle cx="1130" cy="560" r="220" fill="#D0FF00" opacity="0.10" />

  <g transform="translate(96,140)">
    <rect width="120" height="120" rx="28" fill="#A435D2" />
    <circle cx="60" cy="60" r="40" fill="none" stroke="#ffffff" stroke-width="14" />
    <circle cx="60" cy="60" r="15" fill="#0cce6b" />
  </g>
  <text x="250" y="228" font-family="${FONT}" font-size="92" font-weight="700" fill="#ffffff">PageLens</text>

  <text x="98" y="356" font-family="${FONT}" font-size="40" fill="#c7c7d1">See the carbon footprint of any web page.</text>

  ${chips}

  <text x="98" y="566" font-family="${FONT}" font-size="30" fill="#D0FF00">pagelens.iamjarl.com</text>
</svg>`

function renderToPng(svg, width) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { loadSystemFonts: true, defaultFontFamily: 'Arial' },
  })
  return resvg.render().asPng()
}

// OG image
writeFileSync(resolve(publicDir, 'og-image.png'), renderToPng(ogSvg, 1200))

// PNG favicon fallbacks from the same mark as favicon.svg
const faviconSvg = readFileSync(resolve(publicDir, 'favicon.svg'), 'utf8')
writeFileSync(resolve(publicDir, 'apple-touch-icon.png'), renderToPng(faviconSvg, 180))
writeFileSync(resolve(publicDir, 'favicon-32.png'), renderToPng(faviconSvg, 32))

console.log('Generated og-image.png (1200×630), apple-touch-icon.png (180), favicon-32.png (32)')
