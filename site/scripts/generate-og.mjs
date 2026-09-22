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

// The Eco Score panel — the product's signature, and the third thing a social
// card has to carry besides the name and the outcome line (hub DESIGN.md,
// "Social cards"). Figures match PopupMock on the site so the card shows what
// a visitor actually lands on, not an invented screen.
const CARD_BG = '#1b1b20' // bg-card (5% white) resolved over the card background
const CARD_BORDER = '#2c2c30' // border-subtle (12% white) resolved
const DIM = '#9a9aa6'

function scoreCard(x, y, w, h) {
  return `
  <g transform="translate(${x},${y})">
    <rect width="${w}" height="${h}" rx="26" fill="${CARD_BG}" stroke="${CARD_BORDER}" stroke-width="2" />

    <text x="36" y="58" font-family="${FONT}" font-size="24" fill="${DIM}">example.com</text>

    <rect x="36" y="86" width="96" height="96" rx="22" fill="#0cce6b" />
    <text x="84" y="154" font-family="${FONT}" font-size="60" font-weight="700"
          fill="#0f0f14" text-anchor="middle">A</text>

    <text x="156" y="142" font-family="${FONT}" font-size="58" font-weight="700" fill="#ffffff">86</text>
    <text x="222" y="142" font-family="${FONT}" font-size="30" fill="${DIM}">/100</text>
    <text x="156" y="176" font-family="${FONT}" font-size="24" fill="${DIM}">Eco Score</text>

    <rect x="36" y="216" width="${w - 72}" height="2" fill="${CARD_BORDER}" />

    <text x="36" y="286" font-family="${FONT}" font-size="44" font-weight="700" fill="#ffffff">0.24 g</text>
    <text x="36" y="322" font-family="${FONT}" font-size="24" fill="${DIM}">CO\u2082 per view</text>

    <text x="${w / 2 + 12}" y="286" font-family="${FONT}" font-size="44" font-weight="700" fill="#ffffff">28.8 kg</text>
    <text x="${w / 2 + 12}" y="322" font-family="${FONT}" font-size="24" fill="${DIM}">CO\u2082 per year</text>
  </g>`
}

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0f0f14" />
  <circle cx="1050" cy="120" r="280" fill="#A435D2" opacity="0.18" />
  <circle cx="1130" cy="560" r="220" fill="#D0FF00" opacity="0.10" />

  ${logo(96, 108, 104)}
  <text x="224" y="184" font-family="${FONT}" font-size="76" font-weight="700" fill="#ffffff">PageLens</text>

  <text x="96" y="304" font-family="${FONT}" font-size="38" fill="#c7c7d1">See the carbon footprint</text>
  <text x="96" y="352" font-family="${FONT}" font-size="38" fill="#c7c7d1">of any web page.</text>

  ${chipRow(96, 408, 62, 44, 14, 26)}

  <text x="96" y="552" font-family="${FONT}" font-size="28" fill="#D0FF00">pagelens.iamjarl.com</text>

  ${scoreCard(652, 108, 452, 380)}
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
