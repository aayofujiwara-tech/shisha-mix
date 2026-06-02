import { useState, useEffect, useRef } from 'react'
import './InstallPrompt.css'

const DISMISSED_KEY = 'sheeshamix_install_dismissed_at'
const DISMISSED_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7日後に再表示

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream
}

function isAndroidChrome(): boolean {
  const ua = navigator.userAgent
  return (
    /Android/.test(ua) &&
    /Chrome\//.test(ua) &&
    !/Edge|Samsung/.test(ua) &&
    !window.matchMedia('(display-mode: standalone)').matches
  )
}

function isAndroidNonChrome(): boolean {
  return /Android/.test(navigator.userAgent) && !isAndroidChrome()
}

function isInStandaloneMode(): boolean {
  return (
    ('standalone' in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true) ||
    window.matchMedia('(display-mode: standalone)').matches
  )
}

function isDismissed(): boolean {
  const ts = localStorage.getItem(DISMISSED_KEY)
  if (!ts) return false
  return Date.now() - parseInt(ts, 10) < DISMISSED_EXPIRY_MS
}

type GuideType = 'ios' | 'android-chrome' | 'android-other'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [guideType, setGuideType] = useState<GuideType | null>(null)
  const promptFired = useRef(false)

  useEffect(() => {
    if (isInStandaloneMode()) return
    if (isDismissed()) return

    if (isIOS()) {
      setGuideType('ios')
      setVisible(true)
      return
    }

    if (isAndroidNonChrome()) {
      setGuideType('android-other')
      setVisible(true)
      return
    }

    // Android Chrome / Desktop Chrome: beforeinstallprompt を待つ
    const handler = (e: Event) => {
      e.preventDefault()
      console.log('[InstallPrompt] beforeinstallprompt fired')
      promptFired.current = true
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Android Chrome で5秒以内に発火しなければ手動案内にフォールバック
    let fallback: ReturnType<typeof setTimeout> | undefined
    if (isAndroidChrome()) {
      fallback = setTimeout(() => {
        if (!promptFired.current) {
          console.log('[InstallPrompt] fallback to android-chrome guide')
          setGuideType('android-chrome')
          setVisible(true)
        }
      }, 5000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      if (fallback) clearTimeout(fallback)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    }
    setVisible(false)
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    setVisible(false)
  }

  if (!visible) return null

  // 手動案内バナー（iOS / Android非Chrome / Android Chromeフォールバック）
  if (guideType) {
    const desc: Record<GuideType, React.ReactNode> = {
      'ios': <>Safari の <span className="install-prompt-share-icon">⎦↑</span> →「ホーム画面に追加」</>,
      'android-chrome': <>アドレスバー右の <span className="install-prompt-share-icon">⋮</span> →「アプリをインストール」</>,
      'android-other': <>ブラウザのメニュー →「ホーム画面に追加」</>,
    }
    return (
      <div className="install-prompt install-prompt--ios">
        <div className="install-prompt-icon">🪔</div>
        <div className="install-prompt-text">
          <p className="install-prompt-title">ホーム画面に追加できます</p>
          <p className="install-prompt-desc">{desc[guideType]}</p>
        </div>
        <div className="install-prompt-actions">
          <button className="install-prompt-later" onClick={handleDismiss}>閉じる</button>
        </div>
      </div>
    )
  }

  // ネイティブインストールプロンプト（Android Chrome + beforeinstallprompt 発火済）
  return (
    <div className="install-prompt">
      <div className="install-prompt-icon">🪔</div>
      <div className="install-prompt-text">
        <p className="install-prompt-title">ホーム画面に追加しますか？</p>
        <p className="install-prompt-desc">オフラインでも使えます</p>
      </div>
      <div className="install-prompt-actions">
        <button className="install-prompt-later" onClick={handleDismiss}>あとで</button>
        <button className="install-prompt-add" onClick={handleInstall}>追加する</button>
      </div>
    </div>
  )
}
