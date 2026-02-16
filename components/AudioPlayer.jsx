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
    <div className="audio-player" role="region" aria-label="Audio player" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.98))',
      padding: 'clamp(12px, 2vw, 20px) clamp(15px, 3vw, 40px)',
      borderTop: '1px solid #333',
      zIndex: 1001,
      backdropFilter: 'blur(10px)'
    }}>
      {/* Close Button */}
      <button
        className="audio-player-close"
        onClick={onClose}
        aria-label="Close audio player"
        style={{
          position: 'absolute',
          top: 'clamp(8px, 1.5vw, 15px)',
          right: 'clamp(8px, 1.5vw, 15px)',
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
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
        x
      </button>

      <div className="audio-player-inner" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 2vw, 20px)', flexWrap: 'wrap' }}>
        {/* Story Emoji */}
        <div className="audio-player-emoji" style={{
          fontSize: 'clamp(32px, 5vw, 60px)',
          minWidth: 'clamp(50px, 7vw, 80px)',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          borderRadius: 'clamp(8px, 1vw, 12px)',
          padding: 'clamp(6px, 1vw, 10px)'
        }}>
          {currentPlaying.emoji}
        </div>

        {/* Controls Section */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title + Category + Duration */}
          <div className="audio-player-title" style={{ fontWeight: 'bold', fontSize: 'clamp(14px, 1.5vw, 18px)', marginBottom: '5px', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentPlaying.title}
          </div>
          <div className="audio-player-meta" style={{
            fontSize: 'clamp(12px, 1.3vw, 14px)',
            color: '#aaa',
            marginBottom: '10px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}>
            <span>{currentPlaying.category}</span>
            <span style={{ color: '#10b981' }}>{formatTime(duration)}</span>
          </div>

          {/* Controls Row */}
          <div className="audio-player-controls" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 1.5vw, 20px)', flexWrap: 'wrap' }}>
            {/* Skip Backward 10s */}
            <button
              className="audio-player-skip"
              onClick={onSkipBackward}
              aria-label="Skip backward 10 seconds"
              style={{
                background: 'rgba(255,255,255,0.1)',
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
                flexShrink: 0,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              title="Rewind 10s"
            >
              -10
            </button>

            {/* Play/Pause */}
            <button
              className="audio-player-play"
              onClick={onPlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              style={{
                background: '#10b981',
                border: 'none',
                borderRadius: '50%',
                width: 'clamp(48px, 5vw, 55px)',
                height: 'clamp(48px, 5vw, 55px)',
                fontSize: 'clamp(22px, 2.5vw, 26px)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isPlaying ? '||' : '> '}
            </button>

            {/* Skip Forward 10s */}
            <button
              className="audio-player-skip"
              onClick={onSkipForward}
              aria-label="Skip forward 10 seconds"
              style={{
                background: 'rgba(255,255,255,0.1)',
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
                flexShrink: 0,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              title="Forward 10s"
            >
              +10
            </button>

            {/* Progress Bar */}
            <div className="audio-player-progress" style={{ flex: 1, minWidth: '120px' }}>
              <div
                onClick={onSeek}
                role="slider"
                aria-label="Audio progress"
                aria-valuemin={0}
                aria-valuemax={Math.round(duration) || 0}
                aria-valuenow={Math.round(currentTime) || 0}
                aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
                tabIndex={0}
                style={{
                  height: '8px',
                  background: '#333',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '5px',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <div style={{
                  height: '100%',
                  width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                  background: 'linear-gradient(90deg, #10b981, #3b82f6)',
                  transition: 'width 0.1s linear'
                }} />
              </div>
              <div aria-live="polite" aria-atomic="true" style={{
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
            <div className="audio-player-volume" style={{ position: 'relative' }}>
              <button
                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                aria-label="Volume"
                aria-expanded={showVolumeSlider}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '22px',
                  padding: '5px',
                  minWidth: '44px',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Volume"
              >
                {volume === 0 ? 'x' : volume < 0.5 ? 'v' : 'V'}
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
                    aria-label="Volume level"
                    aria-valuemin={0}
                    aria-valuemax={1}
                    aria-valuenow={volume}
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
            <div className="audio-player-speed" style={{ position: 'relative' }}>
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                aria-label={`Playback speed ${playbackSpeed}x`}
                aria-expanded={showSpeedMenu}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid #666',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  minHeight: '44px',
                  minWidth: '44px',
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
                      aria-label={`Set playback speed to ${speed}x`}
                      aria-pressed={speed === playbackSpeed}
                      style={{
                        width: '100%',
                        padding: '10px 15px',
                        background: speed === playbackSpeed ? '#10b981' : 'transparent',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '14px',
                        textAlign: 'center',
                        minHeight: '44px',
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
            <div className="audio-player-sleep" style={{ position: 'relative' }}>
              <button
                aria-label={sleepTimer ? `Sleep timer active: ${sleepTimer} minutes remaining` : 'Set sleep timer'}
                style={{
                  background: sleepTimer ? '#10b981' : 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '22px',
                  padding: '5px',
                  position: 'relative',
                  minWidth: '44px',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={onSleepTimer}
                title={sleepTimer ? `Sleep timer: ${sleepTimer} min` : 'Set sleep timer'}
              >
                zZ
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
