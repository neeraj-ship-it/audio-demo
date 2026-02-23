/**
 * NarrationCaption - Comic narration box
 * Yellow/beige box with black border like traditional Indian comics
 */
export default function NarrationCaption({ text, position = 'bottom', style = 'caption' }) {
  const positionStyles = {
    top: { top: 0, left: 0, right: 0, bottom: 'auto' },
    bottom: { bottom: 0, left: 0, right: 0, top: 'auto' },
    center: { top: '50%', left: '10%', right: '10%', transform: 'translateY(-50%)' },
  }

  const isWhisper = style === 'whisper'

  return (
    <div
      className="comic-narration-caption"
      style={{
        position: 'absolute',
        ...positionStyles[position],
        background: isWhisper ? 'rgba(0,0,0,0.8)' : '#fffde7',
        color: isWhisper ? '#fff' : '#1a1a1a',
        padding: '8px 12px',
        zIndex: 8,
        maxHeight: '30%',
        overflow: 'hidden',
        borderTop: position === 'bottom' ? '3px solid #000' : 'none',
        borderBottom: position === 'top' ? '3px solid #000' : 'none',
        border: position === 'center' ? '3px solid #000' : undefined,
        borderRadius: position === 'center' ? '8px' : '0',
        boxShadow: position === 'center' ? '3px 3px 0px rgba(0,0,0,0.4)' : 'none',
        fontSize: style === 'bold' ? 'clamp(11px, 2.5vw, 15px)' : 'clamp(10px, 2vw, 13px)',
        fontWeight: style === 'bold' ? '900' : '700',
        fontStyle: 'italic',
        lineHeight: '1.5',
        textAlign: 'center',
        letterSpacing: '0.3px',
      }}
    >
      {text}
    </div>
  )
}
