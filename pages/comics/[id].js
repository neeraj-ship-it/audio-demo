import { useEffect, useRef, useCallback } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTheme } from '../../contexts/ThemeContext'
import useComicReader from '../../hooks/useComicReader'
import ComicPanel from '../../components/comics/ComicPanel'
import ComicProgress from '../../components/comics/ComicProgress'
import PanelAudioControl from '../../components/comics/PanelAudioControl'
import ComicEndScreen from '../../components/comics/ComicEndScreen'
import Loading from '../../components/Loading'

export default function ComicReaderPage() {
  const router = useRouter()
  const { id } = router.query
  const { isDarkMode, currentTheme } = useTheme()
  const touchStartRef = useRef({ x: 0, y: 0 })
  const scrollContainerRef = useRef(null)

  const {
    comic, currentPanel, currentPanelData, totalPanels, panelsRead,
    viewMode, isComplete, isPlaying, currentTime, duration,
    readingTimeSeconds, hasNextPanel, hasPrevPanel, currentPanelHasAudio,
    loading, error, audioRef, uiVisible,
    loadComic, nextPanel, prevPanel, goToPanel, toggleAudio,
    setViewMode, toggleUI, restart,
  } = useComicReader()

  useEffect(() => {
    if (id) loadComic(id)
  }, [id, loadComic])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      switch (e.key) {
        case 'ArrowRight': case 'ArrowDown':
          e.preventDefault()
          if (!isComplete) nextPanel()
          break
        case 'ArrowLeft': case 'ArrowUp':
          e.preventDefault()
          prevPanel()
          break
        case ' ':
          e.preventDefault()
          if (currentPanelHasAudio) toggleAudio()
          else if (!isComplete) nextPanel()
          break
        case 'Escape': router.push('/comics'); break
        case 'v': setViewMode(viewMode === 'swipe' ? 'scroll' : 'swipe'); break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isComplete, currentPanelHasAudio, viewMode, nextPanel, prevPanel, toggleAudio, setViewMode, router])

  // Swipe handlers
  const handleTouchStart = useCallback((e) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }, [])

  const handleTouchEnd = useCallback((e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x
    const absX = Math.abs(deltaX)
    const absY = Math.abs(e.changedTouches[0].clientY - touchStartRef.current.y)
    if (absX > 50 && absX > absY * 1.5) {
      if (deltaX < 0 && !isComplete) nextPanel()
      else if (deltaX > 0) prevPanel()
    }
  }, [isComplete, nextPanel, prevPanel])

  // Tap zones
  const handlePanelClick = useCallback((e) => {
    if (viewMode !== 'swipe') return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width
    if (x < width * 0.3) prevPanel()
    else if (x > width * 0.7) { if (!isComplete) nextPanel() }
    else toggleUI()
  }, [viewMode, isComplete, prevPanel, nextPanel, toggleUI])

  // IntersectionObserver for scroll mode
  useEffect(() => {
    if (viewMode !== 'scroll' || !scrollContainerRef.current) return
    const panels = scrollContainerRef.current.querySelectorAll('[data-panel-index]')
    if (!panels.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            const index = parseInt(entry.target.dataset.panelIndex, 10)
            if (!isNaN(index)) goToPanel(index)
          }
        })
      },
      { threshold: 0.3 }
    )
    panels.forEach(panel => observer.observe(panel))
    return () => observer.disconnect()
  }, [viewMode, comic, goToPanel])

  if (loading) return <div style={{ background: '#0a0a0a', minHeight: '100vh', color: 'white' }}><Loading message="Loading comic..." /></div>

  if (error) return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
      <div style={{ fontSize: '60px', marginBottom: '20px' }}>⚠️</div>
      <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>{error}</div>
      <button onClick={() => router.push('/comics')} style={{ background: '#ec4899', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' }}>Back to Comics</button>
    </div>
  )

  if (!comic) return null

  return (
    <>
      <Head>
        <title>{comic.title} - Comic | Stage FM</title>
        <meta name="description" content={comic.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0a0a0a" />
      </Head>

      <div style={{
        background: '#f5f0e8',
        minHeight: '100vh',
        color: '#1a1a1a',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
      }}>

        {/* Header */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: '#1a1a1a',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '3px solid #000',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => router.push('/comics')}
              aria-label="Back to comics"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'white', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {'\u2190'}
            </button>
            <div>
              <div style={{ fontSize: 'clamp(13px, 2vw, 16px)', fontWeight: '800', color: 'white', lineHeight: '1.2' }}>
                {comic.title}
              </div>
              <div style={{ fontSize: '11px', color: '#aaa' }}>
                {comic.emoji} {comic.category} | Panel {currentPanel + 1}/{totalPanels}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setViewMode(viewMode === 'swipe' ? 'scroll' : 'swipe')}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', padding: '8px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: '700', color: 'white', minHeight: '44px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {viewMode === 'swipe' ? '📖 Page View' : '👆 Swipe'}
            </button>
          </div>
        </div>

        {viewMode === 'swipe' ? (
          /* ====== SWIPE MODE - One panel at a time ====== */
          <div style={{ background: '#f5f0e8', minHeight: 'calc(100vh - 60px)' }}>
            <div
              style={{
                maxWidth: '500px',
                margin: '0 auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {isComplete ? (
                <div style={{ width: '100%', minHeight: '60vh', background: '#1a1a1a', borderRadius: '8px', border: '3px solid #000', color: 'white' }}>
                  <ComicEndScreen comic={comic} panelsRead={panelsRead} readingTime={readingTimeSeconds} onReplay={restart} />
                </div>
              ) : currentPanelData ? (
                <>
                  {/* Comic Panel with border */}
                  <div
                    onClick={handlePanelClick}
                    style={{
                      width: '100%',
                      aspectRatio: '3/4',
                      border: '4px solid #000',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: '4px 4px 0px rgba(0,0,0,0.3)',
                      background: '#000',
                    }}
                  >
                    <ComicPanel
                      panel={currentPanelData}
                      characters={comic.characters || []}
                      isActive={true}
                    />
                    <PanelAudioControl
                      isPlaying={isPlaying}
                      hasAudio={currentPanelHasAudio}
                      onToggle={toggleAudio}
                      currentTime={currentTime}
                      duration={duration}
                    />
                  </div>

                  {/* Progress */}
                  <div style={{ width: '100%', background: '#1a1a1a', borderRadius: '12px', padding: '8px', border: '2px solid #333' }}>
                    <ComicProgress currentPanel={currentPanel} totalPanels={totalPanels} onGoToPanel={goToPanel} />
                  </div>

                  {/* Nav buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
                    <button
                      onClick={prevPanel}
                      disabled={!hasPrevPanel}
                      aria-label="Previous panel"
                      style={{
                        flex: 1, background: hasPrevPanel ? '#333' : '#ccc', border: '3px solid #000', cursor: hasPrevPanel ? 'pointer' : 'default',
                        padding: '12px', borderRadius: '8px', color: hasPrevPanel ? 'white' : '#999', fontSize: '14px', fontWeight: '800', minHeight: '44px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', boxShadow: hasPrevPanel ? '2px 2px 0px rgba(0,0,0,0.3)' : 'none',
                      }}
                    >
                      {'\u2190'} Prev
                    </button>
                    <button
                      onClick={nextPanel}
                      aria-label={hasNextPanel ? 'Next panel' : 'Finish'}
                      style={{
                        flex: 1, background: '#ec4899', border: '3px solid #000', cursor: 'pointer',
                        padding: '12px', borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: '800', minHeight: '44px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', boxShadow: '2px 2px 0px rgba(0,0,0,0.3)',
                      }}
                    >
                      {hasNextPanel ? 'Next' : 'Finish'} {'\u2192'}
                    </button>
                  </div>

                  {/* Swipe hint */}
                  <div style={{ fontSize: '11px', color: '#999', textAlign: 'center' }}>
                    Swipe left/right or tap edges | Arrow keys on desktop
                  </div>
                </>
              ) : null}
            </div>
          </div>
        ) : (
          /* ====== SCROLL/PAGE MODE - Comic book grid layout ====== */
          <div
            ref={scrollContainerRef}
            style={{
              maxWidth: '700px',
              margin: '0 auto',
              padding: '16px',
            }}
          >
            {/* Comic Page - Grid of panels like a real comic book */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '6px',
              background: '#000',
              border: '4px solid #000',
              borderRadius: '8px',
              padding: '6px',
              boxShadow: '6px 6px 0px rgba(0,0,0,0.3)',
            }}>
              {comic.panels.map((panel, index) => (
                <div
                  key={panel.id}
                  data-panel-index={index}
                  onClick={() => {
                    goToPanel(index)
                    setViewMode('swipe')
                  }}
                  style={{
                    aspectRatio: '3/4',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '2px solid #333',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <ComicPanel
                    panel={panel}
                    characters={comic.characters || []}
                    isActive={Math.abs(index - currentPanel) <= 4}
                    hideOverlays
                  />
                  {/* Panel number badge */}
                  <div style={{
                    position: 'absolute',
                    top: '4px',
                    left: '4px',
                    background: '#000',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: '900',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    zIndex: 15,
                    border: '1px solid #555',
                  }}>
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* End section */}
            <div style={{ marginTop: '16px', borderRadius: '8px', overflow: 'hidden', minHeight: '40vh', background: '#1a1a1a', border: '4px solid #000', color: 'white' }}>
              <ComicEndScreen
                comic={comic}
                panelsRead={totalPanels}
                readingTime={readingTimeSeconds}
                onReplay={() => {
                  restart()
                  setViewMode('swipe')
                }}
              />
            </div>
          </div>
        )}

        {/* Hidden Audio Element */}
        <audio ref={audioRef} aria-hidden="true" />
      </div>
    </>
  )
}
