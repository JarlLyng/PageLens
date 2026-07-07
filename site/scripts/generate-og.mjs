// Generates the social share (Open Graph) image and PNG favicon fallbacks by
// rasterizing SVG with @resvg/resvg-js. Run locally and commit the outputs so
// the deploy pipeline doesn't depend on fonts being present on CI.
//
// Run: npm run og   (from the site/ directory)

import { Resvg } from '@resvg/resvg-js'
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(dir, '..', 'public')
const storeDir = resolve(dir, '..', '..', 'store-assets')

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
writeFileSync(
  resolve(publicDir, 'apple-touch-icon.png'),
  renderToPng(faviconSvg, 180),
)
writeFileSync(resolve(publicDir, 'favicon-32.png'), renderToPng(faviconSvg, 32))

// --- Chrome Web Store promo tiles (designed marketing assets) ---

/** The brand lens mark as an SVG group, sized to `s`. */
function logo(x, y, s) {
  const c = s / 2
  return `<g transform="translate(${x},${y})">
    <rect width="${s}" height="${s}" rx="${s * 0.234}" fill="#A435D2" />
    <circle cx="${c}" cy="${c}" r="${s * 0.333}" fill="none" stroke="#ffffff" stroke-width="${s * 0.117}" />
    <circle cx="${c}" cy="${c}" r="${s * 0.125}" fill="#0cce6b" />
  </g>`
}

function chipRow(startX, y, cw, ch, gap, fs) {
  return GRADES.map(([letter, color], i) => {
    const x = startX + i * (cw + gap)
    return `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="${ch * 0.22}" fill="${color}" />
      <text x="${x + cw / 2}" y="${y + ch * 0.7}" font-family="${FONT}" font-size="${fs}" font-weight="700" fill="#0f0f14" text-anchor="middle">${letter}</text>`
  }).join('')
}

const marqueeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 560">
  <rect width="1400" height="560" fill="#0f0f14" />
  <circle cx="1230" cy="110" r="300" fill="#A435D2" opacity="0.18" />
  <circle cx="1320" cy="500" r="240" fill="#D0FF00" opacity="0.10" />
  ${logo(110, 150, 150)}
  <text x="300" y="272" font-family="${FONT}" font-size="112" font-weight="700" fill="#ffffff">PageLens</text>
  <text x="112" y="392" font-family="${FONT}" font-size="42" fill="#c7c7d1">See the carbon footprint of any web page.</text>
  ${chipRow(112, 428, 80, 52, 16, 32)}
  <text x="112" y="534" font-family="${FONT}" font-size="30" fill="#D0FF00">pagelens.iamjarl.com</text>
</svg>`

const smallSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 280">
  <rect width="440" height="280" fill="#0f0f14" />
  <circle cx="410" cy="40" r="120" fill="#A435D2" opacity="0.18" />
  ${logo(36, 40, 72)}
  <text x="124" y="94" font-family="${FONT}" font-size="42" font-weight="700" fill="#ffffff">PageLens</text>
  <text x="38" y="156" font-family="${FONT}" font-size="22" fill="#c7c7d1">Website carbon footprint</text>
  ${chipRow(38, 182, 44, 32, 10, 20)}
  <text x="38" y="256" font-family="${FONT}" font-size="18" fill="#D0FF00">pagelens.iamjarl.com</text>
</svg>`

mkdirSync(storeDir, { recursive: true })
writeFileSync(
  resolve(storeDir, 'promo-marquee-1400x560.png'),
  renderToPng(marqueeSvg, 1400),
)
writeFileSync(
  resolve(storeDir, 'promo-small-440x280.png'),
  renderToPng(smallSvg, 440),
)

console.log('Generated: og-image.png, apple-touch-icon.png, favicon-32.png,')
console.log(
  '           store-assets/promo-marquee-1400x560.png, store-assets/promo-small-440x280.png',
)
