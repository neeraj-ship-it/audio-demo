import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

const difficultyColors = {
  easy: { bg: 'rgba(16,185,129,0.2)', border: '#10b981', text: '#10b981', label: 'Easy' },
  medium: { bg: 'rgba(245,158,11,0.2)', border: '#f59e0b', text: '#f59e0b', label: 'Medium' },
  hard: { bg: 'rgba(239,68,68,0.2)', border: '#ef4444', text: '#ef4444', label: 'Hard' },
}

export default function InteractiveStoryCard({ story }) {
  const router = useRouter()
  const [hover, setHover] = useState(false)
  const [savedProgress, setSavedProgress] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem(`interactive_progress_${story.id}`)
    if (saved) {
      try {
        setSavedProgress(JSON.parse(saved))
      } catch (e) { /* ignore */ }
    }
  }, [story.id])

  const diff = difficultyColors[story.difficulty] || difficultyColors.medium
  const hasProgress = savedProgress && savedProgress.totalChoicesMade > 0
  const progressPercent = savedProgress?.completionPercentage || 0
  const endingsFound = savedProgress?.endingsDiscovered?.length || 0

  return (
    <div
      role="article"
      aria-label={story.title}
      style={{
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        transform: hover ? 'scale(1.03)' : 'scale(1)',
        boxShadow: hover
          ? '0 8px 30px rgba(102,126,234,0.4)'
          : '0 4px 15px rgba(0,0,0,0.4)',
        background: '#111',
      }}
      onClick={() => router.push(`/interactive/${story.id}`)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Thumbnail Area */}
      <div style={{
        width: '100%',
        aspectRatio: '3/4',
        background: story.thumbnailUrl
          ? `url(${story.thumbnailUrl}) center/cover no-repeat`
          : `linear-gradient(135deg, #667eea, #764ba2)`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'clamp(40px, 8vw, 70px)',
      }}>
        {!story.thumbnailUrl && <span>{story.emoji}</span>}

        {/* Interactive Badge - Top Left */}
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          background: 'rgba(102,126,234,0.9)',
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '700',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backdropFilter: 'blur(4px)',
          zIndex: 3,
        }}>
          <span style={{ fontSize: '13px' }}>🎮</span> Interactive
        </div>

        {/* Difficulty Badge - Top Right */}
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: diff.bg,
          border: `1.5px solid ${diff.border}`,
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '700',
          color: diff.text,
          backdropFilter: 'blur(4px)',
          zIndex: 3,
        }}>
          {diff.label}
        </div>

        {/* Progress Bar at Bottom of Thumbnail */}
        {hasProgress && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 4,
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #667eea, #764ba2)',
              transition: 'width 0.3s ease',
            }} />
          </div>
        )}

        {/* Bottom gradient overlay */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '55%',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.95))',
          pointerEvents: 'none',
        }} />

        {/* Bottom info */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '0 10px 10px',
          zIndex: 2,
        }}>
          {/* Title */}
          <div style={{
            fontWeight: '700',
            fontSize: 'clamp(13px, 1.5vw, 15px)',
            color: 'white',
            marginBottom: '5px',
            lineHeight: '1.3',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {story.title}
          </div>

          {/* Category + Time */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '5px',
            flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 'clamp(10px, 1.2vw, 12px)', color: '#aaa' }}>
              {story.category}
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(102,126,234,0.15)',
              padding: '2px 6px',
              borderRadius: '10px',
              fontSize: 'clamp(10px, 1.1vw, 11px)',
              fontWeight: '600',
              color: '#667eea',
            }}>
              {story.estimatedTime}
            </span>
          </div>

          {/* Stats Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: 'clamp(10px, 1.2vw, 11px)',
            color: '#888',
            marginBottom: '6px',
          }}>
            <span>{story.totalScenes} scenes</span>
            <span>|</span>
            <span>{story.totalEndings} endings</span>
            {endingsFound > 0 && (
              <>
                <span>|</span>
                <span style={{ color: '#ffd700' }}>
                  {endingsFound}/{story.totalEndings} found
                </span>
              </>
            )}
          </div>

          {/* Start/Continue Button */}
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/interactive/${story.id}`) }}
            aria-label={hasProgress ? `Continue ${story.title}` : `Start ${story.title}`}
            style={{
              width: '100%',
              background: hasProgress
                ? 'linear-gradient(135deg, #667eea, #764ba2)'
                : 'rgba(102,126,234,0.15)',
              border: hasProgress ? 'none' : '1.5px solid #667eea',
              padding: '8px 0',
              borderRadius: '20px',
              fontSize: 'clamp(11px, 1.2vw, 12px)',
              fontWeight: '600',
              color: hasProgress ? 'white' : '#667eea',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              minHeight: '44px',
            }}
          >
            {hasProgress ? `Continue (${progressPercent}%)` : 'Start Story'}
          </button>
        </div>
      </div>
    </div>
  )
}
