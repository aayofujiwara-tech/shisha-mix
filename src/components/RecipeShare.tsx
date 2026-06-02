import { useState } from 'react'
import type { Recipe } from '../types'
import { STRENGTH_LABELS, SWEETNESS_LABELS } from '../types'
import './RecipeShare.css'

const APP_ORIGIN = 'https://shisha-mix-eight.vercel.app'

interface RecipeShareProps {
  recipe: Recipe
}

function buildPageUrl(recipe: Recipe): string {
  if (recipe.isPreset) return APP_ORIGIN + '/'
  return `${APP_ORIGIN}/recipe/${recipe.id}`
}

function buildShareText(recipe: Recipe): string {
  const flavors = (recipe.flavors ?? [])
    .map((f) => `${f.name}（${f.brand}）${f.ratio ?? 0}%`)
    .join('\n')

  const tags = (recipe.category ?? []).join(' ')
  const strength = STRENGTH_LABELS[recipe.strength]
  const sweetness = SWEETNESS_LABELS[recipe.sweetness]

  return [
    '【シーシャミックス】',
    recipe.name,
    '',
    flavors,
    '',
    `系統：${tags || 'なし'} 強度：${strength} 甘さ：${sweetness}`,
    '',
    '#シーシャ #シーシャミックス #SheeshaMix',
  ].join('\n')
}

export default function RecipeShare({ recipe }: RecipeShareProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const pageUrl = buildPageUrl(recipe)
  const shareText = buildShareText(recipe)
  const hasWebShare = typeof navigator !== 'undefined' && !!navigator.share

  const openX = () => {
    const text = encodeURIComponent(shareText + '\n' + pageUrl)
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }

  const openLine = () => {
    const text = encodeURIComponent(shareText)
    const url = encodeURIComponent(pageUrl)
    window.open(`https://social-plugins.line.me/lineit/share?url=${url}&text=${text}`, '_blank')
  }

  const copyUrl = async () => {
    await navigator.clipboard.writeText(pageUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareNative = async () => {
    await navigator.share({ title: recipe.name, text: shareText, url: pageUrl })
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
