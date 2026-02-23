/**
 * SpeechBubble - Traditional comic style dialogue bubble
 * Bold white bubble with thick black border, character color accent, tail pointer
 * Like Chacha Chaudhary / Raj Comics style
 */
export default function SpeechBubble({ character, text, position = 'top-left', style = 'speech-bubble', color = '#667eea' }) {
  const positionStyles = {
    'top-left': { top: '4%', left: '3%', right: 'auto', bottom: 'auto' },
    'top-right': { top: '4%', right: '3%', left: 'auto', bottom: 'auto' },
    'bottom-left': { bottom: '4%', left: '3%', right: 'auto', top: 'auto' },
    'bottom-right': { bottom: '4%', right: '3%', left: 'auto', top: 'auto' },
    'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', right: 'auto', bottom: 'auto' },
  }

  const tailPosition = position.includes('left') ? 'left' : 'right'
  const isBottom = position.includes('bottom')
  const isThought = style === 'thought-bubble'
  const isShout = style === 'shout'

  return (
    <div
      className="comic-speech-bubble"
      style={{
        position: 'absolute',
        ...positionStyles[position],
        maxWidth: '55%',
        minWidth: '80px',
        zIndex: 10,
        maxHeight: '40%',
      }}
    >
      {/* Character name tag */}
      {character && (
        <div style={{
          fontSize: '9px',
          fontWeight: '900',
          color: 'white',
          background: color,
          padding: '1px 8px',
          borderRadius: '10px',
          display: 'inline-block',
          marginBottom: '3px',
          letterSpacing: '0.5px',
          border: '2px solid rgba(0,0,0,0.3)',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        }}>
          {character}
        </div>
      )}

      {/* Bubble body - traditional comic style */}
      <div style={{
        background: '#ffffff',
        color: '#000000',
        padding: '6px 10px',
        borderRadius: isShout ? '6px' : '16px',
        fontSize: 'clamp(10px, 2.2vw, 13px)',
        fontWeight: '700',
        lineHeight: '1.3',
        position: 'relative',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 4,
        WebkitBoxOrient: 'vertical',
        border: isThought
          ? '3px dashed #333'
          : isShout
            ? `4px solid ${color}`
            : '3px solid #000',
        boxShadow: '3px 3px 0px rgba(0,0,0,0.5)',
        wordBreak: 'break-word',
      }}>
        {text}

        {/* Tail - triangle pointer */}
        {!isThought && position !== 'center' && (
          <>
            {/* Outer tail (black border) */}
            <div style={{
              position: 'absolute',
              ...(isBottom
                ? { top: '-14px' }
                : { bottom: '-14px' }
              ),
              ...(tailPosition === 'left'
                ? { left: '18px' }
                : { right: '18px' }
              ),
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              ...(isBottom
                ? { borderBottom: '14px solid #000' }
                : { borderTop: '14px solid #000' }
              ),
            }} />
            {/* Inner tail (white fill) */}
            <div style={{
              position: 'absolute',
              ...(isBottom
                ? { top: '-10px' }
                : { bottom: '-10px' }
              ),
              ...(tailPosition === 'left'
                ? { left: '20px' }
                : { right: '20px' }
              ),
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              ...(isBottom
                ? { borderBottom: '11px solid #ffffff' }
                : { borderTop: '11px solid #ffffff' }
              ),
            }} />
          </>
        )}

        {/* Thought dots */}
        {isThought && (
          <div style={{
            position: 'absolute',
            bottom: '-18px',
            ...(tailPosition === 'left' ? { left: '15px' } : { right: '15px' }),
            display: 'flex',
            gap: '5px',
            alignItems: 'center',
          }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fff', border: '2px solid #333' }} />
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', border: '2px solid #333' }} />
          </div>
        )}
      </div>
    </div>
  )
}
