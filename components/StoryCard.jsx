import { useRouter } from 'next/router'

function getStoryBackground(story) {
  if (story.thumbnailUrl) {
    return `url(${story.thumbnailUrl}) center/cover no-repeat`
  }
  const c1 = ((story.id * 123456) % 0xFFFFFF).toString(16).padStart(6, '0')
  const c2 = ((story.id * 654321) % 0xFFFFFF).toString(16).padStart(6, '0')
  return `linear-gradient(135deg, #${c1}, #${c2})`
}

export default function StoryCard({
  story,
  isPlaying,
  storyRating,
  isFavorite,
  onPlay,
  onShare,
  onRate,
  onFavorite,
}) {
  const router = useRouter()

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        boxShadow: isPlaying
          ? '0 0 0 3px #10b981, 0 8px 25px rgba(16,185,129,0.3)'
          : '0 4px 15px rgba(0,0,0,0.4)',
        background: '#111',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.03)'
        e.currentTarget.style.boxShadow = isPlaying
          ? '0 0 0 3px #10b981, 0 12px 35px rgba(16,185,129,0.4)'
          : '0 8px 30px rgba(0,0,0,0.6)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = isPlaying
          ? '0 0 0 3px #10b981, 0 8px 25px rgba(16,185,129,0.3)'
          : '0 4px 15px rgba(0,0,0,0.4)'
      }}
    >
      {/* Thumbnail Area */}
      <div
        onClick={() => onPlay(story)}
        style={{
          width: '100%',
          aspectRatio: '3/4',
          background: getStoryBackground(story),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '70px',
        }}
      >
        {!story.thumbnailUrl && <span>{story.emoji}</span>}

        {/* Play Button - Green circle top-left */}
        <button
          onClick={(e) => { e.stopPropagation(); onPlay(story) }}
          aria-label={`Play ${story.title}`}
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: '#10b981',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            color: 'white',
            boxShadow: '0 2px 8px rgba(16,185,129,0.5)',
            transition: 'transform 0.2s',
            zIndex: 3,
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isPlaying ? '\u23F8' : '\u25B6'}
        </button>

        {/* NEW Badge - Red, top-right area */}
        {story.new && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: onFavorite ? '52px' : '10px',
            background: '#e50914',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '700',
            color: 'white',
            letterSpacing: '0.5px',
            zIndex: 3,
          }}>
            NEW
          </div>
        )}

        {/* Favorite/Heart Button - Dark circle top-right */}
        {onFavorite && (
          <button
            onClick={(e) => { e.stopPropagation(); onFavorite(story.id) }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              backdropFilter: 'blur(4px)',
              transition: 'transform 0.2s, background 0.2s',
              zIndex: 3,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.15)'
              e.currentTarget.style.background = 'rgba(0,0,0,0.8)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.background = 'rgba(0,0,0,0.6)'
            }}
          >
            <span style={{ color: isFavorite ? '#e50914' : '#fff' }}>
              {isFavorite ? '\u2764\uFE0F' : '\u{1F90D}'}
            </span>
          </button>
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

        {/* Bottom info overlay */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '0 12px 12px',
          zIndex: 2,
        }}>
          {/* Title */}
          <div style={{
            fontWeight: '700',
            fontSize: '15px',
            color: 'white',
            marginBottom: '6px',
            lineHeight: '1.3',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {story.title}
          </div>

          {/* Category + Duration row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '6px',
          }}>
            <span style={{ fontSize: '12px', color: '#aaa' }}>
              {story.category}
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(16,185,129,0.15)',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#10b981',
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#10b981',
                display: 'inline-block',
              }} />
              {story.duration || '5-15 min'}
            </span>
          </div>

          {/* Rating */}
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
            {storyRating && storyRating.total > 0 ? (
              <span style={{ color: '#ffd700', fontWeight: '600' }}>
                \u2B50 {storyRating.average.toFixed(1)} ({storyRating.total})
              </span>
            ) : (
              'No ratings yet'
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={(e) => { e.stopPropagation(); router.push(`/story/${story.id}`) }}
              style={{
                flex: 1,
                background: 'rgba(16,185,129,0.15)',
                border: '1.5px solid #10b981',
                padding: '6px 0',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#10b981',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(16,185,129,0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(16,185,129,0.15)'
              }}
            >
              \u2139\uFE0F Details
            </button>
            {onRate && (
              <button
                onClick={(e) => { e.stopPropagation(); onRate(story, e) }}
                style={{
                  flex: 1,
                  background: 'rgba(16,185,129,0.15)',
                  border: '1.5px solid #10b981',
                  padding: '6px 0',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#10b981',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(16,185,129,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(16,185,129,0.15)'
                }}
              >
                \u2B50 Rate
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
