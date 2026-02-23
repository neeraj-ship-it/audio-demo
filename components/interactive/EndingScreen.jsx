import { useTheme } from '../../contexts/ThemeContext'

const endingStyles = {
  good: {
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    bgGlow: 'rgba(16,185,129,0.1)',
    emoji: '🌅',
    label: 'Good Ending',
  },
  bad: {
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    bgGlow: 'rgba(239,68,68,0.1)',
    emoji: '💀',
    label: 'Bad Ending',
  },
  secret: {
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    bgGlow: 'rgba(245,158,11,0.1)',
    emoji: '👑',
    label: 'Secret Ending',
  },
}

export default function EndingScreen({
  scene,
  story,
  totalChoicesMade,
  endingsDiscovered,
  completionPercentage,
  onRestart,
  onGoBack,
}) {
  const { isDarkMode, currentTheme } = useTheme()

  if (!scene) return null

  const endingType = scene.endingType || 'good'
  const style = endingStyles[endingType] || endingStyles.good
  const totalEndings = story?.totalEndings || 3

  return (
    <div
      className="ending-screen"
      style={{
        animation: 'endingFadeIn 0.8s ease both',
        textAlign: 'center',
        padding: '20px',
      }}
    >
      {/* Ending Type Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 20px',
        background: style.gradient,
        borderRadius: '24px',
        color: 'white',
        fontSize: '14px',
        fontWeight: '700',
        marginBottom: '24px',
        boxShadow: `0 4px 15px ${style.bgGlow}`,
      }}>
        <span style={{ fontSize: '18px' }}>{scene.endingEmoji || style.emoji}</span>
        {style.label}
      </div>

      {/* Ending Title */}
      <h2 style={{
        fontSize: 'clamp(22px, 4vw, 32px)',
        fontWeight: '900',
        color: currentTheme.text,
        marginBottom: '16px',
        lineHeight: '1.3',
      }}>
        {scene.endingTitle || scene.title}
      </h2>

      {/* Ending Text */}
      <div style={{
        fontSize: 'clamp(15px, 2vw, 18px)',
        lineHeight: '1.8',
        color: isDarkMode ? '#d0d0d0' : '#444',
        marginBottom: '32px',
        maxWidth: '600px',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        {scene.text}
      </div>

      {/* Stats Card */}
      <div style={{
        background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        maxWidth: '400px',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        <div style={{
          fontSize: '13px',
          fontWeight: '700',
          color: isDarkMode ? '#667eea' : '#5a67d8',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '16px',
        }}>
          Your Journey
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
        }}>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: currentTheme.text }}>
              {totalChoicesMade}
            </div>
            <div style={{ fontSize: '12px', color: isDarkMode ? '#888' : '#666' }}>
              Choices Made
            </div>
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: currentTheme.text }}>
              {completionPercentage}%
            </div>
            <div style={{ fontSize: '12px', color: isDarkMode ? '#888' : '#666' }}>
              Explored
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}>
              {Array.from({ length: totalEndings }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '20px',
                    opacity: i < endingsDiscovered.length ? 1 : 0.2,
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  {i < endingsDiscovered.length ? '⭐' : '☆'}
                </span>
              ))}
            </div>
            <div style={{ fontSize: '12px', color: isDarkMode ? '#888' : '#666', marginTop: '4px' }}>
              {endingsDiscovered.length}/{totalEndings} Endings Discovered
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '300px',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        {/* Replay Button */}
        <button
          onClick={onRestart}
          aria-label="Replay story with different choices"
          style={{
            width: '100%',
            padding: '14px 24px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            border: 'none',
            borderRadius: '14px',
            color: 'white',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            minHeight: '44px',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
        >
          🔄 Play Again (Different Choices)
        </button>

        {/* Back to Stories */}
        <button
          onClick={onGoBack}
          aria-label="Back to interactive stories"
          style={{
            width: '100%',
            padding: '14px 24px',
            background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            border: `1.5px solid ${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '14px',
            color: currentTheme.text,
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            minHeight: '44px',
            transition: 'all 0.2s',
          }}
        >
          Browse More Stories
        </button>
      </div>
    </div>
  )
}
