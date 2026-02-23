import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

/**
 * ComicStoryCard - Card for the comics listing grid
 * Shows thumbnail, comic badge, panel count, reading progress
 */
export default function ComicStoryCard({ story }) {
  const router = useRouter()
  const [hover, setHover] = useState(false)
  const [savedProgress, setSavedProgress] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem(`comic_progress_${story.id}`)
    if (saved) {
      try {
        setSavedProgress(JSON.parse(saved))
      } catch (e) { /* ignore */ }
    }
  }, [story.id])

  const hasProgress = savedProgress && savedProgress.panelsRead > 0
  const progressPercent = savedProgress
    ? Math.round((savedProgress.panelsRead / story.totalPanels) * 100)
    : 0
  const isComplete = savedProgress?.completed

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
          ? '0 8px 30px rgba(236,72,153,0.4)'
          : '0 4px 15px rgba(0,0,0,0.4)',
        background: '#111',
      }}
      onClick={() => router.push(`/comics/${story.id}`)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Thumbnail Area */}
      <div style={{
        width: '100%',
        aspectRatio: '3/4',
        background: story.thumbnailUrl
          ? `url(${story.thumbnailUrl}) center/cover no-repeat`
          : 'linear-gradient(135deg, #ec4899, #f59e0b)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'clamp(40px, 8vw, 70px)',
      }}>
        {!story.thumbnailUrl && <span>{story.emoji}</span>}

        {/* Comic Badge - Top Left */}
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          background: 'rgba(236,72,153,0.9)',
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
          <span style={{ fontSize: '13px' }}>📚</span> Comic
        </div>

        {/* Panel Count Badge - Top Right */}
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(0,0,0,0.6)',
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '700',
          color: 'white',
          backdropFilter: 'blur(4px)',
          zIndex: 3,
        }}>
          {story.totalPanels} panels
        </div>

        {/* Completion badge */}
        {isComplete && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(16,185,129,0.9)',
            padding: '6px 14px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: '700',
            color: 'white',
            zIndex: 5,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            Read
          </div>
        )}

        {/* Progress Bar at Bottom of Thumbnail */}
        {hasProgress && !isComplete && (
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
              background: 'linear-gradient(90deg, #ec4899, #f59e0b)',
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
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
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
              background: 'rgba(236,72,153,0.15)',
              padding: '2px 6px',
              borderRadius: '10px',
              fontSize: 'clamp(10px, 1.1vw, 11px)',
              fontWeight: '600',
              color: '#ec4899',
            }}>
              {story.estimatedTime}
            </span>
            {story.hasAudio && (
              <span style={{
                background: 'rgba(102,126,234,0.15)',
                padding: '2px 6px',
                borderRadius: '10px',
                fontSize: 'clamp(10px, 1.1vw, 11px)',
                fontWeight: '600',
                color: '#667eea',
              }}>
                Audio
              </span>
            )}
          </div>

          {/* Start/Continue Button */}
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/comics/${story.id}`) }}
            aria-label={hasProgress ? `Continue ${story.title}` : `Read ${story.title}`}
            style={{
              width: '100%',
              background: hasProgress
                ? 'linear-gradient(135deg, #ec4899, #f59e0b)'
                : 'rgba(236,72,153,0.15)',
              border: hasProgress ? 'none' : '1.5px solid #ec4899',
              padding: '8px 0',
              borderRadius: '20px',
              fontSize: 'clamp(11px, 1.2vw, 12px)',
              fontWeight: '600',
              color: hasProgress ? 'white' : '#ec4899',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              minHeight: '44px',
            }}
          >
            {isComplete
              ? 'Read Again'
              : hasProgress
                ? `Continue (${progressPercent}%)`
                : 'Read Comic'}
          </button>
        </div>
      </div>
    </div>
  )
}
