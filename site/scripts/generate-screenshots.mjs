// Generates a Chrome Web Store screenshot (1280×800) by reproducing the popup
// UI as SVG and rasterizing it with @resvg/resvg-js. This is a pixel-accurate
// rendering of the actual popup (light theme) on a branded backdrop — an honest
// representation of what users see. Run: npm run shots (from site/).

import { Resvg } from '@resvg/resvg-js'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = dirname(fileURLToPath(import.meta.url))
const storeDir = resolve(dir, '..', '..', 'store-assets')
const FONT = 'Arial, Helvetica, sans-serif'

const C = {
  text: '#161616',
  sub: '#555560',
  faint: '#8a8a94',
  border: '#e6e6ea',
  track: '#eef0f2',
  primary: '#A435D2',
  gradeA: '#0cce6b',
  green: '#1a8a4a',
}

const t = (x, y, size, fill, content, { w = 400, anchor = 'start' } = {}) =>
  `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${w}" fill="${fill}" text-anchor="${anchor}">${content}</text>`

// --- Popup card geometry ---
const CX = 720
const CY = 80
const CW = 470
const CH = 600
const px = CX + 28 // inner left
const pr = CX + CW - 28 // inner right

const subScores = [
  ['Carbon', 82],
  ['Weight', 71],
  ['Hosting', 100],
  ['Best practices', 90],
]
const subScoreRows = subScores
  .map(([label, val], i) => {
    const y = CY + 205 + i * 22
    const trackX = px + 128
    const trackW = 150
    return `
      ${t(px, y, 13, C.sub, label)}
      <rect x="${trackX}" y="${y - 9}" width="${trackW}" height="6" rx="3" fill="${C.track}" />
      <rect x="${trackX}" y="${y - 9}" width="${(trackW * val) / 100}" height="6" rx="3" fill="${C.primary}" />
      ${t(pr, y, 13, C.sub, String(val), { anchor: 'end' })}`
  })
  .join('')

// Page-weight stacked bar
const segs = [
  [42, '#f59e0b'],
  [28, '#10b981'],
  [15, '#8b5cf6'],
  [9, '#0ea5e9'],
  [6, '#ec4899'],
]
let segX = px
const weightBar = segs
  .map(([pct, color]) => {
    const w = ((pr - px) * pct) / 100
    const r = `<rect x="${segX}" y="${CY + 486}" width="${w}" height="11" fill="${color}" />`
    segX += w
    return r
  })
  .join('')

const card = `
  <rect x="${CX + 6}" y="${CY + 12}" width="${CW}" height="${CH}" rx="22" fill="#c9b6da" opacity="0.5" />
  <rect x="${CX}" y="${CY}" width="${CW}" height="${CH}" rx="22" fill="#ffffff" stroke="${C.border}" />

  <!-- header -->
  <rect x="${px}" y="${CY + 26}" width="32" height="32" rx="8" fill="${C.primary}" />
  ${t(px + 16, CY + 48, 18, '#ffffff', 'P', { w: 700, anchor: 'middle' })}
  ${t(px + 44, CY + 49, 20, C.text, 'PageLens', { w: 700 })}
  ${t(px, CY + 84, 15, C.faint, 'example.com')}

  <!-- eco score card -->
  <rect x="${px}" y="${CY + 100}" width="${CW - 56}" height="200" rx="14" fill="#ffffff" stroke="${C.border}" />
  <rect x="${px + 20}" y="${CY + 118}" width="64" height="64" rx="16" fill="${C.gradeA}" />
  ${t(px + 52, CY + 163, 40, '#ffffff', 'A', { w: 700, anchor: 'middle' })}
  ${t(px + 104, CY + 156, 36, C.text, '86', { w: 700 })}
  ${t(px + 150, CY + 156, 20, C.faint, '/100')}
  ${t(px + 104, CY + 180, 15, C.sub, 'Eco Score')}
  ${subScoreRows}

  <!-- carbon tiles -->
  <rect x="${px}" y="${CY + 315}" width="195" height="78" rx="14" fill="#ffffff" stroke="${C.border}" />
  ${t(px + 18, CY + 356, 24, C.text, '0.24 g', { w: 700 })}
  ${t(px + 18, CY + 378, 14, C.sub, 'CO&#8322; per view')}
  <rect x="${px + 211}" y="${CY + 315}" width="195" height="78" rx="14" fill="#ffffff" stroke="${C.border}" />
  ${t(px + 229, CY + 356, 24, C.text, '28.8 kg', { w: 700 })}
  ${t(px + 229, CY + 378, 14, C.sub, 'CO&#8322; per year')}

  <!-- green hosting -->
  <circle cx="${px + 10}" cy="${CY + 425}" r="10" fill="${C.gradeA}" />
  <path d="M ${px + 5} ${CY + 425} l 3.2 3.4 l 6.2 -7" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
  ${t(px + 30, CY + 430, 17, C.green, 'Green hosted', { w: 700 })}

  <!-- page weight -->
  ${t(px, CY + 470, 16, C.text, 'Page weight', { w: 700 })}
  ${t(pr, CY + 470, 16, C.text, '1.2 MB', { w: 700, anchor: 'end' })}
  <clipPath id="wclip"><rect x="${px}" y="${CY + 486}" width="${pr - px}" height="11" rx="5.5" /></clipPath>
  <g clip-path="url(#wclip)">${weightBar}</g>

  <!-- recommendation -->
  <rect x="${px}" y="${CY + 516}" width="${CW - 56}" height="54" rx="12" fill="#ffffff" stroke="${C.border}" />
  <rect x="${px + 14}" y="${CY + 532}" width="54" height="22" rx="6" fill="#fdeaea" />
  ${t(px + 41, CY + 547, 11, '#d00000', 'HIGH', { w: 700, anchor: 'middle' })}
  ${t(px + 82, CY + 549, 15, C.text, 'Compress oversized images', { w: 600 })}
  ${t(pr - 14, CY + 549, 13, C.faint, '~420 KB', { anchor: 'end' })}
`

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f7f3fd" />
      <stop offset="1" stop-color="#efe6fb" />
    </linearGradient>
  </defs>
  <rect width="1280" height="800" fill="url(#bg)" />
  <circle cx="1180" cy="80" r="220" fill="${C.primary}" opacity="0.10" />
  <circle cx="120" cy="760" r="200" fill="#D0FF00" opacity="0.10" />

  <!-- caption -->
  <rect x="90" y="150" width="220" height="38" rx="19" fill="#ffffff" stroke="${C.border}" />
  ${t(200, 175, 15, C.primary, 'CHROME EXTENSION', { w: 700, anchor: 'middle' })}
  ${t(88, 300, 62, C.text, 'See any page&#8217;s', { w: 700 })}
  ${t(88, 372, 62, C.text, 'carbon footprint.', { w: 700 })}
  ${t(90, 438, 25, C.sub, 'An A&#8211;F Eco Score, CO&#8322; estimate, green')}
  ${t(90, 472, 25, C.sub, 'hosting check, and fixes that matter.')}
  ${t(90, 700, 24, C.primary, 'pagelens.iamjarl.com', { w: 700 })}

  ${card}
</svg>`

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1280 },
  font: { loadSystemFonts: true, defaultFontFamily: 'Arial' },
})
mkdirSync(storeDir, { recursive: true })
writeFileSync(resolve(storeDir, 'screenshot-1-1280x800.png'), resvg.render().asPng())
console.log('Generated store-assets/screenshot-1-1280x800.png')
