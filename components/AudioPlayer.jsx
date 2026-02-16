export default function AudioPlayer({
  currentPlaying,
  isPlaying,
  currentTime,
  duration,
  volume,
  playbackSpeed,
  showVolumeSlider,
  setShowVolumeSlider,
  showSpeedMenu,
  setShowSpeedMenu,
  sleepTimer,
  onPlayPause,
  onSkipForward,
  onSkipBackward,
  onSeek,
  onVolumeChange,
  onSpeedChange,
  onSleepTimer,
  onClose,
  formatTime,
}) {
  if (!currentPlaying) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.98))',
      padding: '20px 40px',
      borderTop: '1px solid #333',
      zIndex: 1001,
      backdropFilter: 'blur(10px)'
    }}>
      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
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
        ✕
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Story Emoji */}
        <div style={{
          fontSize: '60px',
          minWidth: '80px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          borderRadius: '12px',
          padding: '10px'
        }}>
          {currentPlaying.emoji}
        </div>

        {/* Controls Section */}
        <div style={{ flex: 1 }}>
          {/* Title + Category + Duration */}
          <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '5px', color: 'white' }}>
            {currentPlaying.title}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#aaa',
            marginBottom: '10px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}>
            <span>{currentPlaying.category}</span>
            <span>•</span>
            <span style={{ color: '#10b981' }}>⏱️ {formatTime(duration)}</span>
          </div>

          {/* Controls Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Skip Backward 10s */}
            <button
              onClick={onSkipBackward}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              title="Rewind 10s"
            >
              ⏪
            </button>

            {/* Play/Pause */}
            <button
              onClick={onPlayPause}
              style={{
                background: '#10b981',
                border: 'none',
                borderRadius: '50%',
                width: '55px',
                height: '55px',
                fontSize: '26px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>

            {/* Skip Forward 10s */}
            <button
              onClick={onSkipForward}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              title="Forward 10s"
            >
              ⏩
            </button>

            {/* Progress Bar */}
            <div style={{ flex: 1 }}>
              <div
                onClick={onSeek}
                style={{
                  height: '6px',
                  background: '#333',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  marginBottom: '5px',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onMouseEnter={(e) => e.currentTarget.style.height = '8px'}
                onMouseLeave={(e) => e.currentTarget.style.height = '6px'}
              >
                <div style={{
                  height: '100%',
                  width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                  background: 'linear-gradient(90deg, #10b981, #3b82f6)',
                  transition: 'width 0.1s linear'
                }} />
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#aaa',
                fontWeight: '500'
              }}>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Volume Control */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '22px',
                  padding: '5px'
                }}
                title="Volume"
              >
                {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
              </button>
              {showVolumeSlider && (
                <div style={{
                  position: 'absolute',
                  bottom: '45px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.95)',
                  padding: '15px 10px',
                  borderRadius: '10px',
                  border: '1px solid #333'
                }}>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    style={{
                      width: '80px',
                      transform: 'rotate(-90deg)',
                      transformOrigin: 'center',
                      margin: '30px 0'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Playback Speed */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid #666',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}
                title="Playback Speed"
              >
                {playbackSpeed}x
              </button>
              {showSpeedMenu && (
                <div style={{
                  position: 'absolute',
                  bottom: '45px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.95)',
                  borderRadius: '10px',
                  border: '1px solid #333',
                  overflow: 'hidden',
                  minWidth: '100px'
                }}>
                  {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(speed => (
                    <button
                      key={speed}
                      onClick={() => onSpeedChange(speed)}
                      style={{
                        width: '100%',
                        padding: '10px 15px',
                        background: speed === playbackSpeed ? '#10b981' : 'transparent',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '14px',
                        textAlign: 'center'
                      }}
                      onMouseEnter={(e) => {
                        if (speed !== playbackSpeed) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                      }}
                      onMouseLeave={(e) => {
                        if (speed !== playbackSpeed) e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sleep Timer */}
            <div style={{ position: 'relative' }}>
              <button
                style={{
                  background: sleepTimer ? '#10b981' : 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '22px',
                  padding: '5px',
                  position: 'relative'
                }}
                onClick={onSleepTimer}
                title={sleepTimer ? `Sleep timer: ${sleepTimer} min` : 'Set sleep timer'}
              >
                ⏰
                {sleepTimer > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: '#e50914',
                    borderRadius: '50%',
                    padding: '2px 6px',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>
                    {sleepTimer}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
