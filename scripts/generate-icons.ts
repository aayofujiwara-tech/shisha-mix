/**
 * Generate PWA icons for all required sizes using a shisha pipe SVG design.
 * Usage: npm run generate-icons
 */
import sharp from 'sharp'
import { mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dir, '../public/icons')

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

// Shisha pipe SVG — dark background, amber icon
// Designed to be clear at all sizes down to 72px
function buildSvg(size: number): string {
  const r = size         // viewBox dimension
  const pad = size * 0.1  // 10% padding
  const cx = r / 2
  // Icon element sizes (all relative to r)
  const smokeX = [cx - r * 0.09, cx, cx + r * 0.09]
  const smokeTop = pad + r * 0.01
  const smokeH = r * 0.11
  const bowlY = pad + r * 0.13
  const bowlW = r * 0.32
  const bowlH = r * 0.1
  const stemX = cx - r * 0.035
  const stemW = r * 0.07
  const stemTop = bowlY + bowlH
  const stemH = r * 0.14
  const neckTop = stemTop + stemH
  const neckW = r * 0.14
  const neckH = r * 0.07
  const vaseTop = neckTop + neckH * 0.8
  const vaseBottom = r - pad - r * 0.04
  const vaseW = r * 0.38
  const baseH = r * 0.04
  const baseW = r * 0.42
  const hoseY = neckTop + neckH + r * 0.1
  const hoseX1 = cx + vaseW * 0.7
  const hoseX2 = hoseX1 + r * 0.1
  const cornerR = size < 128 ? size * 0.12 : size * 0.15

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r} ${r}" width="${r}" height="${r}">
  <!-- Background -->
  <rect width="${r}" height="${r}" rx="${cornerR}" fill="#0d0f14"/>

  <!-- Smoke wisps -->
  <path d="M${smokeX[0]},${smokeTop + smokeH} Q${smokeX[0] - r * 0.035},${smokeTop + smokeH * 0.5} ${smokeX[0]},${smokeTop + smokeH * 0.1} Q${smokeX[0] + r * 0.025},${smokeTop} ${smokeX[0]},${smokeTop - smokeH * 0.4}"
    stroke="#e8a234" stroke-width="${r * 0.022}" fill="none" stroke-linecap="round" opacity="0.9"/>
  <path d="M${smokeX[1]},${smokeTop + smokeH} Q${smokeX[1] + r * 0.03},${smokeTop + smokeH * 0.5} ${smokeX[1]},${smokeTop + smokeH * 0.1} Q${smokeX[1] - r * 0.025},${smokeTop} ${smokeX[1]},${smokeTop - smokeH * 0.4}"
    stroke="#e8a234" stroke-width="${r * 0.022}" fill="none" stroke-linecap="round" opacity="0.6"/>
  <path d="M${smokeX[2]},${smokeTop + smokeH} Q${smokeX[2] - r * 0.028},${smokeTop + smokeH * 0.5} ${smokeX[2]},${smokeTop + smokeH * 0.1} Q${smokeX[2] + r * 0.022},${smokeTop} ${smokeX[2]},${smokeTop - smokeH * 0.4}"
    stroke="#e8a234" stroke-width="${r * 0.018}" fill="none" stroke-linecap="round" opacity="0.4"/>

  <!-- Bowl (top) -->
  <rect x="${cx - bowlW / 2}" y="${bowlY}" width="${bowlW}" height="${bowlH}" rx="${bowlH * 0.4}" fill="#e8a234"/>
  <ellipse cx="${cx}" cy="${bowlY}" rx="${bowlW / 2}" ry="${bowlH * 0.35}" fill="#e8a234" opacity="0.7"/>

  <!-- Stem -->
  <rect x="${stemX}" y="${stemTop}" width="${stemW}" height="${stemH}" rx="${stemW * 0.4}" fill="#e8a234"/>

  <!-- Neck (widening) -->
  <path d="M${cx - neckW / 2},${neckTop + neckH} L${cx - stemW / 2},${neckTop} L${cx + stemW / 2},${neckTop} L${cx + neckW / 2},${neckTop + neckH} Z" fill="#e8a234"/>

  <!-- Vase body -->
  <path d="M${cx - neckW / 2},${vaseTop}
    C${cx - neckW / 2 - r * 0.02},${vaseTop + (vaseBottom - vaseTop) * 0.2} ${cx - vaseW},${vaseTop + (vaseBottom - vaseTop) * 0.4} ${cx - vaseW},${vaseTop + (vaseBottom - vaseTop) * 0.65}
    Q${cx - vaseW},${vaseBottom - r * 0.02} ${cx},${vaseBottom}
    Q${cx + vaseW},${vaseBottom - r * 0.02} ${cx + vaseW},${vaseTop + (vaseBottom - vaseTop) * 0.65}
    C${cx + vaseW},${vaseTop + (vaseBottom - vaseTop) * 0.4} ${cx + neckW / 2 + r * 0.02},${vaseTop + (vaseBottom - vaseTop) * 0.2} ${cx + neckW / 2},${vaseTop}
    Z" fill="#e8a234"/>

  <!-- Hose port -->
  <rect x="${hoseX1}" y="${hoseY - r * 0.025}" width="${hoseX2 - hoseX1 + r * 0.04}" height="${r * 0.05}" rx="${r * 0.025}" fill="#e8a234"/>
  <circle cx="${hoseX2 + r * 0.04}" cy="${hoseY}" r="${r * 0.038}" fill="none" stroke="#e8a234" stroke-width="${r * 0.022}"/>

  <!-- Base plate -->
  <ellipse cx="${cx}" cy="${vaseBottom + r * 0.01}" rx="${baseW / 2}" ry="${baseH / 2}" fill="#e8a234" opacity="0.35"/>
</svg>`
}

async function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })
  console.log(`Generating icons in ${OUT_DIR}\n`)
  for (const size of SIZES) {
    const svg = buildSvg(size)
    const outPath = resolve(OUT_DIR, `icon-${size}.png`)
    await sharp(Buffer.from(svg)).png().toFile(outPath)
    console.log(`  ✓ icon-${size}.png`)
  }
  console.log('\nDone!')
}

main().catch((e) => { console.error(e); process.exit(1) })
