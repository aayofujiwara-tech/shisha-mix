/**
 * Generate a 1200x630 OGP image for シーシャミックス.
 * Usage: npm run generate-ogp
 */
import sharp from 'sharp'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const OUT_FILE = resolve(__dir, '../public/ogp.png')

const W = 1200
const H = 630

function buildShishaIconPaths(size: number): string {
  const r = size
  const pad = r * 0.1
  const cx = r / 2
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
  return `
    <path d="M${smokeX[0]},${smokeTop+smokeH} Q${smokeX[0]-r*0.035},${smokeTop+smokeH*0.5} ${smokeX[0]},${smokeTop+smokeH*0.1} Q${smokeX[0]+r*0.025},${smokeTop} ${smokeX[0]},${smokeTop-smokeH*0.4}" stroke="#e8a234" stroke-width="${r*0.022}" fill="none" stroke-linecap="round" opacity="0.9"/>
    <path d="M${smokeX[1]},${smokeTop+smokeH} Q${smokeX[1]+r*0.03},${smokeTop+smokeH*0.5} ${smokeX[1]},${smokeTop+smokeH*0.1} Q${smokeX[1]-r*0.025},${smokeTop} ${smokeX[1]},${smokeTop-smokeH*0.4}" stroke="#e8a234" stroke-width="${r*0.022}" fill="none" stroke-linecap="round" opacity="0.6"/>
    <path d="M${smokeX[2]},${smokeTop+smokeH} Q${smokeX[2]-r*0.028},${smokeTop+smokeH*0.5} ${smokeX[2]},${smokeTop+smokeH*0.1} Q${smokeX[2]+r*0.022},${smokeTop} ${smokeX[2]},${smokeTop-smokeH*0.4}" stroke="#e8a234" stroke-width="${r*0.018}" fill="none" stroke-linecap="round" opacity="0.4"/>
    <rect x="${cx-bowlW/2}" y="${bowlY}" width="${bowlW}" height="${bowlH}" rx="${bowlH*0.4}" fill="#e8a234"/>
    <ellipse cx="${cx}" cy="${bowlY}" rx="${bowlW/2}" ry="${bowlH*0.35}" fill="#e8a234" opacity="0.7"/>
    <rect x="${stemX}" y="${stemTop}" width="${stemW}" height="${stemH}" rx="${stemW*0.4}" fill="#e8a234"/>
    <path d="M${cx-neckW/2},${neckTop+neckH} L${cx-stemW/2},${neckTop} L${cx+stemW/2},${neckTop} L${cx+neckW/2},${neckTop+neckH} Z" fill="#e8a234"/>
    <path d="M${cx-neckW/2},${vaseTop} C${cx-neckW/2-r*0.02},${vaseTop+(vaseBottom-vaseTop)*0.2} ${cx-vaseW},${vaseTop+(vaseBottom-vaseTop)*0.4} ${cx-vaseW},${vaseTop+(vaseBottom-vaseTop)*0.65} Q${cx-vaseW},${vaseBottom-r*0.02} ${cx},${vaseBottom} Q${cx+vaseW},${vaseBottom-r*0.02} ${cx+vaseW},${vaseTop+(vaseBottom-vaseTop)*0.65} C${cx+vaseW},${vaseTop+(vaseBottom-vaseTop)*0.4} ${cx+neckW/2+r*0.02},${vaseTop+(vaseBottom-vaseTop)*0.2} ${cx+neckW/2},${vaseTop} Z" fill="#e8a234"/>
    <rect x="${hoseX1}" y="${hoseY-r*0.025}" width="${hoseX2-hoseX1+r*0.04}" height="${r*0.05}" rx="${r*0.025}" fill="#e8a234"/>
    <circle cx="${hoseX2+r*0.04}" cy="${hoseY}" r="${r*0.038}" fill="none" stroke="#e8a234" stroke-width="${r*0.022}"/>
    <ellipse cx="${cx}" cy="${vaseBottom+r*0.01}" rx="${baseW/2}" ry="${baseH/2}" fill="#e8a234" opacity="0.35"/>
  `
}

function buildOgpSvg(): string {
  const FONT = "'Yu Gothic','Meiryo','Hiragino Sans','Noto Sans JP','MS PGothic',sans-serif"
  const ICON_SIZE = 220
  const ICON_X = 76
  const ICON_Y = 115
  const dots = Array.from({length:6},(_,row)=>Array.from({length:10},(_,col)=>`<circle cx="${80+col*50}" cy="${160+row*70}" r="1" fill="#e8a234" opacity="0.06"/>`).join('')).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#e8a234" stop-opacity="0"/>
      <stop offset="20%"  stop-color="#e8a234" stop-opacity="1"/>
      <stop offset="80%"  stop-color="#e8a234" stop-opacity="1"/>
      <stop offset="100%" stop-color="#e8a234" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#14171f"/>
      <stop offset="100%" stop-color="#0d0f14"/>
    </linearGradient>
    <radialGradient id="iconGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#e8a234" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#e8a234" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bgGrad)"/>
  ${dots}
  <rect x="0" y="0" width="${W}" height="5" fill="url(#amberGrad)"/>
  <rect x="0" y="${H-5}" width="${W}" height="5" fill="url(#amberGrad)"/>
  <ellipse cx="${ICON_X+ICON_SIZE/2}" cy="${ICON_Y+ICON_SIZE/2+20}" rx="${ICON_SIZE*0.85}" ry="${ICON_SIZE*0.7}" fill="url(#iconGlow)"/>
  <g transform="translate(${ICON_X},${ICON_Y})">${buildShishaIconPaths(ICON_SIZE)}</g>
  <text x="80" y="400" font-family="${FONT}" font-size="58" font-weight="700" fill="#e8a234" letter-spacing="3">シーシャミックス</text>
  <text x="82" y="450" font-family="${FONT}" font-size="24" fill="#ffffff" opacity="0.75">あなたのレシピを、もっと自由に。</text>
  <line x1="598" y1="55" x2="598" y2="575" stroke="#e8a234" stroke-width="1" opacity="0.18"/>
  <text x="640" y="115" font-family="'Courier New',monospace" font-size="12" fill="#e8a234" opacity="0.55" letter-spacing="5">FEATURES</text>
  <rect x="640" y="132" width="3" height="52" rx="1.5" fill="#e8a234" opacity="0.85"/>
  <text x="658" y="150" font-family="${FONT}" font-size="14" fill="#e8a234" font-weight="600" opacity="0.65">検索・フィルター</text>
  <text x="658" y="176" font-family="${FONT}" font-size="26" fill="#ffffff">110種のプリセットレシピ</text>
  <rect x="640" y="222" width="3" height="52" rx="1.5" fill="#e8a234" opacity="0.85"/>
  <text x="658" y="240" font-family="${FONT}" font-size="14" fill="#e8a234" font-weight="600" opacity="0.65">記録・共有</text>
  <text x="658" y="266" font-family="${FONT}" font-size="26" fill="#ffffff">マイレシピを記録・共有</text>
  <rect x="640" y="312" width="3" height="52" rx="1.5" fill="#e8a234" opacity="0.85"/>
  <text x="658" y="330" font-family="${FONT}" font-size="14" fill="#e8a234" font-weight="600" opacity="0.65">店舗管理</text>
  <text x="658" y="356" font-family="${FONT}" font-size="26" fill="#ffffff">シーシャカフェ向け店舗管理</text>
  <circle cx="642" cy="415" r="3" fill="#e8a234" opacity="0.5"/>
  <circle cx="656" cy="415" r="3" fill="#e8a234" opacity="0.3"/>
  <circle cx="670" cy="415" r="3" fill="#e8a234" opacity="0.15"/>
  <text x="${W/2}" y="606" text-anchor="middle" font-family="'Courier New',monospace" font-size="18" fill="#4a5568" letter-spacing="1">shisha-mix-eight.vercel.app</text>
</svg>`
}

async function main() {
  console.log('Generating OGP image (1200x630)...')
  await sharp(Buffer.from(buildOgpSvg())).png({ quality: 95 }).toFile(OUT_FILE)
  console.log(`✓ ${OUT_FILE}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
