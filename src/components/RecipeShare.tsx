import { useState } from 'react'
import type { Recipe } from '../types'
import './RecipeShare.css'

const APP_ORIGIN = 'https://shisha-mix-eight.vercel.app'

const STRENGTH: Record<string, string> = { weak: '弱', medium: '中', strong: '強' }
const SWEETNESS: Record<string, string> = { low: '低', medium: '中', high: '高' }

interface RecipeShareProps {
  recipe: Recipe
}

function buildPageUrl(recipe: Recipe): string {
  if (recipe.id) {
    return `${APP_ORIGIN}/recipe/${recipe.id}`
  }
  return APP_ORIGIN + '/'
}

function buildShareText(recipe: Recipe, url: string): string {
  const flavorsText = (recipe.flavors ?? [])
    .map((f) => `${f.name}（${f.brand}）${f.ratio ?? 0}%`)
    .join('\n')
  const categories = (recipe.category ?? []).join(' ') || 'なし'
  const strength = STRENGTH[recipe.strength] ?? recipe.strength
  const sweetness = SWEETNESS[recipe.sweetness] ?? recipe.sweetness

  return [
    `【シーシャミックス】${recipe.name}`,
    '',
    flavorsText,
    '',
    `系統：${categories}`,
    `強度：${strength} 甘さ：${sweetness}`,
    '',
    '#シーシャ #シーシャミックス #SheeshaMix',
    url,
  ].join('\n')
}

function buildLineText(recipe: Recipe, url: string): string {
  const flavorsText = (recipe.flavors ?? [])
    .map((f) => `${f.name}（${f.brand}）${f.ratio ?? 0}%`)
    .join('\n')
  const categories = (recipe.category ?? []).join(' ') || 'なし'
  const strength = STRENGTH[recipe.strength] ?? recipe.strength
  const sweetness = SWEETNESS[recipe.sweetness] ?? recipe.sweetness

  return [
    `【シーシャミックス】${recipe.name}`,
    '',
    flavorsText,
    '',
    `系統：${categories} 強度：${strength} 甘さ：${sweetness}`,
    '',
    `SheeshaMixで見る→ ${url}`,
  ].join('\n')
}

export default function RecipeShare({ recipe }: RecipeShareProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const pageUrl = buildPageUrl(recipe)
  const xText = buildShareText(recipe, pageUrl)
  const lineText = buildLineText(recipe, pageUrl)
  const hasWebShare = typeof navigator !== 'undefined' && !!navigator.share

  const openX = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(xText)}`, '_blank')
  }

  const openLine = () => {
    // LINE share: テキストにURLを含めて送る（url パラメータは最低限）
    const text = encodeURIComponent(lineText)
    const url = encodeURIComponent(pageUrl)
    window.open(`https://social-plugins.line.me/lineit/share?url=${url}&text=${text}`, '_blank')
  }

  const copyUrl = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(pageUrl)
      } else {
        // HTTP環境・iOS Safari フォールバック
        const ta = document.createElement('textarea')
        ta.value = pageUrl
        ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
        document.body.appendChild(ta)
        ta.focus()
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('[RecipeShare] コピー失敗:', err)
    }
  }

  const shareNative = async () => {
    await navigator.share({ title: recipe.name, text: xText, url: pageUrl })
  }

  return (
    <div className="rs-share">
      <button className="rs-toggle" onClick={() => setOpen((v) => !v)}>
        <span>🔗 シェア</span>
        <span className="rs-chevron">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="rs-body">
          <button className="rs-btn rs-btn-x" onClick={openX}>
            <span className="rs-btn-icon">𝕏</span>
            <span>Xでシェア</span>
          </button>
          <button className="rs-btn rs-btn-line" onClick={openLine}>
            <span className="rs-btn-icon">💚</span>
            <span>LINEで送る</span>
          </button>
          <button className="rs-btn rs-btn-copy" onClick={copyUrl}>
            <span className="rs-btn-icon">🔗</span>
            <span>{copied ? '✓ コピーしました' : 'URLをコピー'}</span>
          </button>
          {hasWebShare && (
            <button className="rs-btn rs-btn-native" onClick={shareNative}>
              <span className="rs-btn-icon">📤</span>
              <span>その他</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
