import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Check if already dismissed
    if (typeof window === 'undefined') return
    const dismissed = localStorage.getItem('stagefm_install_dismissed')
    if (dismissed) return

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShow(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShow(false)
    localStorage.setItem('stagefm_install_dismissed', 'true')
  }

  if (!show) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
      border: '1px solid rgba(102, 126, 234, 0.4)',
      borderRadius: '16px',
      padding: '14px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      zIndex: 9999,
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      maxWidth: '420px',
      width: 'calc(100% - 32px)',
      animation: 'slideUp 0.3s ease'
    }}>
      <div style={{fontSize: '28px', flexShrink: 0}}>🎵</div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '2px'
        }}>
          Install STAGE fm
        </div>
        <div style={{color: '#aaa', fontSize: '12px'}}>
          Offline access & faster experience
        </div>
      </div>
      <button
        onClick={handleInstall}
        style={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          border: 'none',
          borderRadius: '20px',
          padding: '8px 16px',
          color: 'white',
          fontSize: '13px',
          fontWeight: 'bold',
          cursor: 'pointer',
          flexShrink: 0
        }}
      >
        Install
      </button>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss install prompt"
        style={{
          background: 'none',
          border: 'none',
          color: '#666',
          fontSize: '18px',
          cursor: 'pointer',
          padding: '4px',
          flexShrink: 0
        }}
      >
        ✕
      </button>
      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}
