import { useTheme } from '../../contexts/ThemeContext'

export default function SceneViewer({
  scene,
  isTransitioning,
  isPlaying,
  currentTime,
  duration,
  onToggleAudio,
  formatTime,
}) {
  const { isDarkMode, currentTheme } = useTheme()

  if (!scene) return null

  const hasAudio = !!scene.audioUrl
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className="scene-viewer"
      style={{
        position: 'relative',
        width: '100%',
        opacity: isTransitioning ? 0 : 1,
        transform: isTransitioning ? 'translateY(20px)' : 'translateY(0)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Scene Image */}
      {scene.imageUrl ? (
        <div style={{
          width: '100%',
          height: 'clamp(200px, 40vh, 400px)',
          background: `url(${scene.imageUrl}) center/cover no-repeat`,
          borderRadius: '16px',
          position: 'relative',
          marginBottom: '20px',
        }}>
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60%',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
            borderRadius: '0 0 16px 16px',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            right: '16px',
          }}>
            <h2 style={{
              fontSize: 'clamp(18px, 3vw, 24px)',
              fontWeight: '800',
              color: 'white',
              margin: 0,
            }}>
              {scene.title}
            </h2>
          </div>
        </div>
      ) : (
        <div style={{
          width: '100%',
          padding: '24px',
          background: isDarkMode
            ? 'linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1))'
            : 'linear-gradient(135deg, rgba(102,126,234,0.05), rgba(118,75,162,0.05))',
          borderRadius: '16px',
          border: `1px solid ${isDarkMode ? 'rgba(102,126,234,0.2)' : 'rgba(102,126,234,0.1)'}`,
          marginBottom: '20px',
        }}>
          <h2 style={{
            fontSize: 'clamp(18px, 3vw, 24px)',
            fontWeight: '800',
            color: currentTheme.text,
            margin: '0 0 4px 0',
          }}>
            {scene.title}
          </h2>
        </div>
      )}

      {/* Scene Text */}
      <div style={{
        fontSize: 'clamp(15px, 2vw, 18px)',
        lineHeight: '1.8',
        color: isDarkMode ? '#d0d0d0' : '#333',
        padding: '0 4px',
        marginBottom: '20px',
      }}>
        {scene.text}
      </div>

      {/* Audio Controls (inline) */}
      {hasAudio && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
          borderRadius: '12px',
          marginBottom: '20px',
        }}>
          <button
            onClick={onToggleAudio}
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              color: 'white',
              flexShrink: 0,
              transition: 'transform 0.2s',
            }}
          >
            {isPlaying ? '\u23F8' : '\u25B6'}
          </button>

          {/* Progress bar */}
          <div style={{
            flex: 1,
            height: '6px',
            background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #667eea, #764ba2)',
              borderRadius: '3px',
              transition: 'width 0.1s linear',
            }} />
          </div>

          <span style={{
            fontSize: '12px',
            color: isDarkMode ? '#888' : '#666',
            fontFamily: 'monospace',
            flexShrink: 0,
          }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      )}
    </div>
  )
}
