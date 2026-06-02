import { useState, useEffect } from 'react'
import './InstallPrompt.css'

const VISIT_KEY = 'sheeshamix_visit_count'
const DISMISSED_KEY = 'sheeshamix_install_dismissed'
const MIN_VISITS = 3

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Track visit count
    const count = parseInt(localStorage.getItem(VISIT_KEY) ?? '0', 10) + 1
    localStorage.setItem(VISIT_KEY, String(count))

    const dismissed = localStorage.getItem(DISMISSED_KEY)
    if (dismissed || count < MIN_VISITS) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') localStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

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
