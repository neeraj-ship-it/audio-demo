import SpeechBubble from './SpeechBubble'
import NarrationCaption from './NarrationCaption'

/**
 * ComicPanel - Full panel renderer
 * Composes: background image + narration captions + speech bubbles
 */
export default function ComicPanel({ panel, characters = [], isActive = true, onClick, hideOverlays = false }) {
  // Build character color lookup
  const charColors = {}
  characters.forEach(c => { charColors[c.name] = c.color })

  const hasImage = panel.imageUrl && panel.imageUrl.trim() !== ''

  return (
    <div
      className="comic-panel"
      onClick={onClick}
      role="img"
      aria-label={panel.narrationText || `Panel ${panel.order}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: hasImage ? '#000' : 'linear-gradient(135deg, #1a1a2e, #16213e)',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* Background Image */}
      {hasImage ? (
        <img
          src={panel.imageUrl}
          alt={panel.narrationText || `Panel ${panel.order}`}
          loading={isActive ? 'eager' : 'lazy'}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            zIndex: 1,
          }}
          draggable={false}
        />
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.6 }}>🎨</div>
          <div style={{
            fontSize: 'clamp(13px, 2.5vw, 16px)',
            color: 'rgba(255,255,255,0.5)',
            maxWidth: '80%',
            lineHeight: '1.5',
          }}>
            {panel.imagePrompt || `Panel ${panel.order}`}
          </div>
        </div>
      )}

      {/* Narration Captions */}
      {!hideOverlays && (panel.textOverlays || []).map((overlay, i) => (
        <NarrationCaption
          key={`narration-${i}`}
          text={overlay.text}
          position={overlay.position}
          style={overlay.style}
        />
      ))}

      {/* Speech Bubbles */}
      {!hideOverlays && (panel.dialogue || []).map((dlg, i) => (
        <SpeechBubble
          key={`dialogue-${i}`}
          character={dlg.character}
          text={dlg.text}
          position={dlg.position}
          style={dlg.style}
          color={charColors[dlg.character] || '#667eea'}
        />
      ))}
    </div>
  )
}
