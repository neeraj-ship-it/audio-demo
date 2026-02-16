import { useState } from 'react'

export default function MiniPlayer({
  currentPlaying,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onClose,
  onSkipForward,
  onSkipBackward,
  formatTime,
  userFavorites = [],
  toggleFavorite
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!currentPlaying) return null

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <>
      {/* Mini Player - Collapsed */}
      {!isExpanded && (
        <div
          className="mini-player-collapsed"
          role="region"
          aria-label="Mini audio player"
          onClick={() => setIsExpanded(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '320px',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95), rgba(118, 75, 162, 0.95))',
            borderRadius: '16px',
            padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            cursor: 'pointer',
            zIndex: 1000,
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            transition: 'all 0.3s ease',
            animation: 'slideUp 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)'
          }}
        >
          {/* Progress Bar */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '16px 16px 0 0',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${progressPercentage}%`,
              background: 'linear-gradient(90deg, #10b981, #34d399)',
              transition: 'width 0.1s linear'
            }} />
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            {/* Emoji/Thumbnail */}
            <div style={{
              fontSize: '32px',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '10px',
              flexShrink: 0
            }}>
              {currentPlaying.emoji}
            </div>

            {/* Info */}
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{
                fontWeight: 'bold',
                fontSize: '14px',
                color: 'white',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginBottom: '2px'
              }}>
                {currentPlaying.title}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>{currentPlaying.category}</span>
                <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
            </div>

            {/* Quick Controls */}
            <div style={{display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0}}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onPlayPause()
                }}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.35)'
                  e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.25)'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                {isPlaying ? '||' : '> '}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
                aria-label="Close mini player"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.25)'
                  e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                x
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Player - Full Controls */}
      {isExpanded && (
        <div
          className="mini-player-expanded"
          role="region"
          aria-label="Expanded audio player"
          style={{
            position: 'fixed',
            bottom: 0,
            right: 0,
            width: '420px',
            maxWidth: '100vw',
            background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.98), rgba(31, 41, 55, 0.98))',
            borderRadius: '16px 16px 0 0',
            padding: 'clamp(16px, 3vw, 24px)',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
            zIndex: 1001,
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderBottom: 'none',
            animation: 'slideUp 0.3s ease',
            maxHeight: '90vh',
            maxHeight: '90dvh',
            overflowY: 'auto'
          }}
        >
          {/* Header */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <div style={{fontSize: '14px', fontWeight: 'bold', color: '#667eea'}}>
              Now Playing
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              aria-label="Minimize player"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                color: 'white',
                transition: 'all 0.2s',
                minHeight: '44px',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              Minimize
            </button>
          </div>

          {/* Artwork */}
          <div style={{
            width: '100%',
            height: 'clamp(160px, 30vh, 240px)',
            background: currentPlaying.thumbnailUrl
              ? `url(${currentPlaying.thumbnailUrl}) center/cover`
              : 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'clamp(60px, 10vw, 100px)',
            marginBottom: '20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
          }}>
            {!currentPlaying.thumbnailUrl && currentPlaying.emoji}
          </div>

          {/* Title & Category */}
          <div style={{marginBottom: '20px', textAlign: 'center'}}>
            <div style={{
              fontWeight: 'bold',
              fontSize: 'clamp(16px, 2vw, 18px)',
              color: 'white',
              marginBottom: '6px'
            }}>
              {currentPlaying.title}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#aaa'
            }}>
              {currentPlaying.category}
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{marginBottom: '10px'}}>
            <div
              role="slider"
              aria-label="Audio progress"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration) || 0}
              aria-valuenow={Math.round(currentTime) || 0}
              aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
              tabIndex={0}
              style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '4px',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
            >
              <div style={{
                height: '100%',
                width: `${progressPercentage}%`,
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                transition: 'width 0.1s linear',
                borderRadius: '4px'
              }} />
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#888',
              marginTop: '6px'
            }}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginTop: '20px'
          }}>
            {/* Skip Backward */}
            <button
              onClick={onSkipBackward}
              aria-label="Skip backward 10 seconds"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                e.currentTarget.style.transform = 'scale(1.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              -10
            </button>

            {/* Play/Pause */}
            <button
              onClick={onPlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none',
                borderRadius: '50%',
                width: '64px',
                height: '64px',
                fontSize: '28px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                transition: 'all 0.2s',
                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)'
              }}
            >
              {isPlaying ? '||' : '> '}
            </button>

            {/* Skip Forward */}
            <button
              onClick={onSkipForward}
              aria-label="Skip forward 10 seconds"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                e.currentTarget.style.transform = 'scale(1.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              +10
            </button>
          </div>

          {/* Like Button - Full Width */}
          {toggleFavorite && (
            <button
              onClick={() => toggleFavorite(currentPlaying.id)}
              aria-label={userFavorites.includes(currentPlaying.id) ? 'Remove from favorites' : 'Add to favorites'}
              style={{
                width: '100%',
                marginTop: '16px',
                background: userFavorites.includes(currentPlaying.id)
                  ? 'rgba(239, 68, 68, 0.2)'
                  : 'rgba(255,255,255,0.1)',
                border: userFavorites.includes(currentPlaying.id)
                  ? '1px solid rgba(239, 68, 68, 0.4)'
                  : '1px solid rgba(255,255,255,0.2)',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: userFavorites.includes(currentPlaying.id) ? '#ef4444' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                minHeight: '48px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = userFavorites.includes(currentPlaying.id)
                  ? 'rgba(239, 68, 68, 0.3)'
                  : 'rgba(255,255,255,0.15)'
                e.currentTarget.style.transform = 'scale(1.02)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = userFavorites.includes(currentPlaying.id)
                  ? 'rgba(239, 68, 68, 0.2)'
                  : 'rgba(255,255,255,0.1)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {userFavorites.includes(currentPlaying.id) ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close player"
            style={{
              width: '100%',
              marginTop: '20px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#ef4444',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minHeight: '48px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'
              e.currentTarget.style.transform = 'scale(1.02)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            Close Player
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}
