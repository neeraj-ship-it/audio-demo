/**
 * PanelAudioControl - Floating play/pause button for per-panel audio
 */
export default function PanelAudioControl({ isPlaying, hasAudio, onToggle, currentTime, duration }) {
  if (!hasAudio) return null

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div style={{
      position: 'absolute',
      bottom: '60px',
      right: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      zIndex: 20,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      borderRadius: '24px',
      padding: '6px 12px 6px 6px',
    }}>
      {/* Play/Pause Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggle() }}
        aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: 'none',
          background: isPlaying
            ? 'rgba(102,126,234,0.9)'
            : 'rgba(255,255,255,0.2)',
          color: 'white',
          fontSize: '16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          minWidth: '36px',
          minHeight: '36px',
          padding: 0,
        }}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>

      {/* Time display */}
      {duration > 0 && (
        <div style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.8)',
          fontWeight: '600',
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      )}

      {/* Mini progress ring around play button */}
      {isPlaying && duration > 0 && (
        <svg
          style={{ position: 'absolute', left: '6px', top: '6px', width: '36px', height: '36px', pointerEvents: 'none' }}
          viewBox="0 0 36 36"
        >
          <circle
            cx="18" cy="18" r="16"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
          />
          <circle
            cx="18" cy="18" r="16"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${100 - progress}`}
            strokeDashoffset="25"
            style={{ transition: 'stroke-dasharray 0.3s ease' }}
          />
        </svg>
      )}
    </div>
  )
}
