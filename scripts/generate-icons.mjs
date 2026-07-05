// Dependency-free PNG icon generator for PageLens.
// Draws a brand-purple rounded square with a white "lens" ring and a green
// eco core, at 4x supersampling for crisp edges, then encodes PNG via zlib.
//
// Run: node scripts/generate-icons.mjs   (regenerates public/icons/*.png)

import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SIZES = [16, 32, 48, 128]
const SS = 4 // supersampling factor

// Brand colors (light-mode primary + eco accent).
const PURPLE = [164, 53, 210]
const WHITE = [255, 255, 255]
const GREEN = [12, 206, 107]

function inRoundRect(x, y, w, h, r) {
  const cx = Math.min(Math.max(x, r), w - r)
  const cy = Math.min(Math.max(y, r), h - r)
  const dx = x - cx
  const dy = y - cy
  return dx * dx + dy * dy <= r * r
}

/** Color (r,g,b,a) for a hi-res pixel at (x,y). */
function shade(x, y, hi) {
  const c = hi / 2
  const dc = Math.hypot(x - c, y - c)
  const outerR = hi * 0.34
  const innerR = hi * 0.22
  const dotR = hi * 0.12

  if (dc <= dotR) return [...GREEN, 255]
  if (dc >= innerR && dc <= outerR) return [...WHITE, 255]
  if (inRoundRect(x, y, hi, hi, hi * 0.22)) return [...PURPLE, 255]
  return [0, 0, 0, 0]
}

/** Render one icon size to a raw RGBA buffer with supersampled downscale. */
function renderRGBA(size) {
  const hi = size * SS
  const out = Buffer.alloc(size * size * 4)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let sumA = 0
      let sumR = 0
      let sumG = 0
      let sumB = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const [r, g, b, a] = shade(x * SS + sx + 0.5, y * SS + sy + 0.5, hi)
          sumA += a
          sumR += r * a
          sumG += g * a
          sumB += b * a
        }
      }
      const i = (y * size + x) * 4
      const alpha = Math.round(sumA / (SS * SS))
      out[i] = sumA ? Math.round(sumR / sumA) : 0
      out[i + 1] = sumA ? Math.round(sumG / sumA) : 0
      out[i + 2] = sumA ? Math.round(sumB / sumA) : 0
      out[i + 3] = alpha
    }
  }
  return out
}

// --- Minimal PNG encoder (8-bit RGBA) ---
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const body = Buffer.concat([typeBuf, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([len, body, crc])
}

function encodePNG(rgba, size) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  // compression, filter, interlace = 0

  // Add per-scanline filter byte (0 = none).
  const stride = size * 4
  const raw = Buffer.alloc((stride + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
  }

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons')
mkdirSync(outDir, { recursive: true })

for (const size of SIZES) {
  const png = encodePNG(renderRGBA(size), size)
  const file = resolve(outDir, `icon${size}.png`)
  writeFileSync(file, png)
  console.log(`wrote ${file} (${png.length} bytes)`)
}
