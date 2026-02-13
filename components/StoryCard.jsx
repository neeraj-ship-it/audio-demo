import { useRouter } from 'next/router'

const DIALECT_COLORS = {
  Haryanvi: { bg: 'rgba(255, 107, 107, 0.2)', border: '#ff6b6b', color: '#ff6b6b', emoji: '\uD83C\uDFAD' },
  Gujarati: { bg: 'rgba(245, 158, 11, 0.2)', border: '#f59e0b', color: '#f59e0b', emoji: '\uD83C\uDFA8' },
  Bhojpuri: { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', color: '#10b981', emoji: '\uD83C\uDFAA' },
  Rajasthani: { bg: 'rgba(139, 92, 246, 0.2)', border: '#8b5cf6', color: '#8b5cf6', emoji: '\uD83C\uDFDC\uFE0F' },
}

const DEFAULT_DIALECT = { bg: 'rgba(102, 126, 234, 0.2)', border: '#667eea', color: '#667eea', emoji: '\uD83C\uDF10' }

function getStoryBackground(story) {
  if (story.thumbnailUrl) {
    return `url(${story.thumbnailUrl}) center/cover`
  }
  const c1 = ((story.id * 123456) % 0xFFFFFF).toString(16).padStart(6, '0')
  const c2 = ((story.id * 654321) % 0xFFFFFF).toString(16).padStart(6, '0')
  return `linear-gradient(135deg, #${c1}, #${c2})`
}

export default function StoryCard({
  story,
  isPlaying,
  storyRating,
  onPlay,
  onShare,
  onRate,
  showBadge,
  badgeLabel,
  badgeColor = '#10b981',
}) {
  const router = useRouter()
  const dialect = DIALECT_COLORS[story.language] || DEFAULT_DIALECT

  return (
    <div
      onClick={() => onPlay(story)}
      role="button"
      tabIndex={0}
      aria-label={`Play ${story.title}`}
      onKeyDown={(e) => { if (e.key === 'Enter') onPlay(story) }}
      style={{
        position: 'relative',
        cursor: 'pointer',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'transform 0.3s ease',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        border: isPlaying ? '3px solid #10b981' : 'none'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      {/* Thumbnail */}
      <div style={{
        width: '100%',
        height: '340px',
        background: getStoryBackground(story),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '80px',
        position: 'relative',
        opacity: story.generated ? 1 : 0.5
      }}>
        {!story.thumbnailUrl && story.emoji}

        {/* Badge (NEW, Play, Coming Soon) */}
        {showBadge && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: badgeColor,
            padding: '5px 12px',
            borderRadius: badgeLabel === 'NEW' ? '4px' : '50%',
            fontSize: badgeLabel === 'NEW' ? '11px' : '16px',
            fontWeight: 'bold',
            color: 'white',
            zIndex: 2
          }}>
            {badgeLabel}
          </div>
        )}

        {story.new && !showBadge && (
          <div style={{
            position: 'absolute', top: '12px', right: '12px',
            background: '#e50914', padding: '5px 12px', borderRadius: '4px',
            fontSize: '11px', fontWeight: 'bold', color: 'white', zIndex: 2
          }}>
            NEW
          </div>
        )}

        {story.generated && !showBadge && (
          <div style={{
            position: 'absolute', top: '12px', left: '12px',
            background: '#10b981', padding: '5px 12px', borderRadius: '50%',
            fontSize: '16px', fontWeight: 'bold'
          }}>
            \u25B6\uFE0F
          </div>
        )}

        {!story.generated && !showBadge && (
          <div style={{
            position: 'absolute', top: '12px', left: '12px',
            background: '#666', padding: '5px 12px', borderRadius: '4px',
            fontSize: '11px', fontWeight: 'bold', color: 'white'
          }}>
            COMING SOON
          </div>
        )}

        {/* Share Button */}
        {onShare && (
          <button
            onClick={(e) => onShare(story, e)}
            aria-label={`Share ${story.title}`}
            style={{
              position: 'absolute', top: '12px', right: '12px',
              background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
              width: '36px', height: '36px', fontSize: '16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', backdropFilter: 'blur(5px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.15)'
              e.currentTarget.style.background = 'rgba(0,0,0,0.8)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.background = 'rgba(0,0,0,0.6)'
            }}
            title="Share this story"
          >
            \uD83D\uDCE4
          </button>
        )}
      </div>

      {/* Info Overlay */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.95))',
        padding: '50px 15px 15px'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px', color: 'white' }}>
          {story.title}
        </div>
        <div style={{
          fontSize: '13px', color: '#aaa',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '6px', marginBottom: '8px'
        }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span>{story.category}</span>
            {story.language && (
              <span style={{
                background: dialect.bg,
                border: `1px solid ${dialect.border}`,
                padding: '3px 8px', borderRadius: '10px',
                fontSize: '11px', fontWeight: 'bold', color: dialect.color
              }}>
                {dialect.emoji} {story.language}
              </span>
            )}
          </div>
          <span style={{
            background: 'rgba(16, 185, 129, 0.2)', padding: '4px 10px',
            borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', color: '#10b981'
          }}>
            \u23F1\uFE0F {story.duration || '5-15 min'}
          </span>
        </div>

        {/* Rating */}
        <div style={{ marginTop: '8px', marginBottom: '8px' }}>
          {storyRating && storyRating.total > 0 ? (
            <div style={{ fontSize: '13px', color: '#ffd700', fontWeight: 'bold' }}>
              \u2B50 {storyRating.average.toFixed(1)} ({storyRating.total})
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: '#666' }}>No ratings yet</div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/story/${story.id}`) }}
            style={{
              flex: 1, background: 'rgba(16, 185, 129, 0.3)', border: '1px solid #10b981',
              padding: '6px 10px', borderRadius: '15px', fontSize: '11px',
              fontWeight: 'bold', color: '#10b981', cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.5)'
              e.currentTarget.style.transform = 'scale(1.02)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.3)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            \u2139\uFE0F Details
          </button>
          {onRate && (
            <button
              onClick={(e) => onRate(story, e)}
              style={{
                flex: 1, background: 'rgba(255, 215, 0, 0.2)', border: '1px solid #ffd700',
                padding: '6px 10px', borderRadius: '15px', fontSize: '11px',
                fontWeight: 'bold', color: '#ffd700', cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 215, 0, 0.4)'
                e.currentTarget.style.transform = 'scale(1.02)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 215, 0, 0.2)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              \u2B50 Rate
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
