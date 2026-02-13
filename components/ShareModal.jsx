import { useState } from 'react'

export default function ShareModal({ story, onClose }) {
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?story=${story.id}`
    : ''
  const shareText = `Check out "${story.title}" on STAGE fm! ${story.emoji} ${story.category}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOnWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`
    window.open(whatsappUrl, '_blank')
  }

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(twitterUrl, '_blank')
  }

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(facebookUrl, '_blank')
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1a1a1a',
          borderRadius: '15px',
          padding: '30px',
          maxWidth: '450px',
          width: '100%',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none',
            border: 'none',
            color: '#aaa',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>

        {/* Story Info */}
        <div style={{
          textAlign: 'center',
          marginBottom: '25px'
        }}>
          <div style={{ fontSize: '60px', marginBottom: '10px' }}>
            {story.emoji}
          </div>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '22px' }}>
            Share "{story.title}"
          </h2>
          <p style={{ color: '#aaa', fontSize: '14px', margin: 0 }}>
            {story.category}
          </p>
        </div>

        {/* Share Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* WhatsApp */}
          <button
            onClick={shareOnWhatsApp}
            style={{
              background: 'linear-gradient(135deg, #25D366, #128C7E)',
              border: 'none',
              borderRadius: '10px',
              padding: '14px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={{ fontSize: '20px' }}>💬</span>
            Share on WhatsApp
          </button>

          {/* Twitter */}
          <button
            onClick={shareOnTwitter}
            style={{
              background: 'linear-gradient(135deg, #1DA1F2, #0D8BD9)',
              border: 'none',
              borderRadius: '10px',
              padding: '14px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={{ fontSize: '20px' }}>🐦</span>
            Share on Twitter
          </button>

          {/* Facebook */}
          <button
            onClick={shareOnFacebook}
            style={{
              background: 'linear-gradient(135deg, #4267B2, #365899)',
              border: 'none',
              borderRadius: '10px',
              padding: '14px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={{ fontSize: '20px' }}>📘</span>
            Share on Facebook
          </button>

          {/* Copy Link */}
          <button
            onClick={copyToClipboard}
            style={{
              background: copied ? '#10b981' : 'rgba(255,255,255,0.1)',
              border: '2px solid ' + (copied ? '#10b981' : '#666'),
              borderRadius: '10px',
              padding: '14px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!copied) e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
            }}
            onMouseLeave={(e) => {
              if (!copied) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            }}
          >
            <span style={{ fontSize: '20px' }}>{copied ? '✅' : '🔗'}</span>
            {copied ? 'Link Copied!' : 'Copy Link'}
          </button>
        </div>

        {/* Link Preview */}
        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: '#2a2a2a',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#aaa',
          wordBreak: 'break-all',
          textAlign: 'center'
        }}>
          {shareUrl}
        </div>
      </div>
    </div>
  )
}
