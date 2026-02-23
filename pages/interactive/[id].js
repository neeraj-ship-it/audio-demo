import { useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTheme } from '../../contexts/ThemeContext'
import useInteractiveStory from '../../hooks/useInteractiveStory'
import SceneViewer from '../../components/interactive/SceneViewer'
import ChoiceButtons from '../../components/interactive/ChoiceButtons'
import StoryProgress from '../../components/interactive/StoryProgress'
import EndingScreen from '../../components/interactive/EndingScreen'
import Loading from '../../components/Loading'

export default function InteractiveStoryPlayer() {
  const router = useRouter()
  const { id } = router.query
  const { isDarkMode, currentTheme } = useTheme()

  const {
    story,
    currentScene,
    currentSceneId,
    choiceHistory,
    endingsDiscovered,
    scenesVisited,
    completionPercentage,
    totalChoicesMade,
    isTransitioning,
    isEnding,
    isPlaying,
    currentTime,
    duration,
    loading,
    error,
    audioRef,
    loadStory,
    makeChoice,
    toggleAudio,
    restart,
    formatTime,
  } = useInteractiveStory()

  // Load story when id is available
  useEffect(() => {
    if (id) {
      loadStory(id)
    }
  }, [id, loadStory])

  // Keyboard shortcut: Space = toggle audio
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === ' ' && currentScene?.audioUrl) {
        e.preventDefault()
        toggleAudio()
      }
      if (e.key === 'Escape') {
        router.push('/interactive')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentScene, toggleAudio, router])

  if (loading) {
    return (
      <div style={{ background: currentTheme.bg, minHeight: '100vh', color: currentTheme.text }}>
        <Loading message="Loading story..." />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        background: currentTheme.bg,
        minHeight: '100vh',
        color: currentTheme.text,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>⚠️</div>
        <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>{error}</div>
        <button
          onClick={() => router.push('/interactive')}
          style={{
            background: '#667eea',
            color: 'white',
            border: 'none',
            padding: '10px 25px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '20px',
          }}
        >
          Back to Stories
        </button>
      </div>
    )
  }

  if (!story || !currentScene) return null

  return (
    <>
      <Head>
        <title>{story.title} - Interactive Story | Stage FM</title>
        <meta name="description" content={story.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
      </Head>

      <div style={{
        background: currentTheme.bg,
        minHeight: '100vh',
        color: currentTheme.text,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        transition: 'background 0.3s ease',
      }}>
        {/* Top Bar */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: isDarkMode ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${currentTheme.border}`,
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => router.push('/interactive')}
                aria-label="Back to interactive stories"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: currentTheme.text,
                  minWidth: '44px',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {'\u2190'}
              </button>
              <div>
                <div style={{
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  fontWeight: '700',
                  lineHeight: '1.2',
                }}>
                  {story.title}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: isDarkMode ? '#888' : '#666',
                }}>
                  {story.emoji} {story.category}
                </div>
              </div>
            </div>

            {/* Restart button */}
            {totalChoicesMade > 0 && (
              <button
                onClick={restart}
                aria-label="Restart story"
                style={{
                  background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: currentTheme.text,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  minHeight: '44px',
                }}
              >
                Restart
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <StoryProgress
            completionPercentage={completionPercentage}
            totalChoicesMade={totalChoicesMade}
            scenesVisited={scenesVisited}
            totalScenes={story.totalScenes || Object.keys(story.scenes).length}
            endingsDiscovered={endingsDiscovered}
            totalEndings={story.totalEndings || Object.values(story.scenes).filter(s => s.isEnding).length}
          />
        </div>

        {/* Main Content */}
        <div style={{
          maxWidth: '700px',
          margin: '0 auto',
          padding: 'clamp(16px, 3vw, 32px) clamp(16px, 3vw, 24px) 100px',
        }}>
          {isEnding ? (
            <EndingScreen
              scene={currentScene}
              story={story}
              totalChoicesMade={totalChoicesMade}
              endingsDiscovered={endingsDiscovered}
              completionPercentage={completionPercentage}
              onRestart={restart}
              onGoBack={() => router.push('/interactive')}
            />
          ) : (
            <>
              <SceneViewer
                scene={currentScene}
                isTransitioning={isTransitioning}
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                onToggleAudio={toggleAudio}
                formatTime={formatTime}
              />

              <ChoiceButtons
                choices={currentScene.choices}
                onChoice={makeChoice}
                disabled={isTransitioning}
              />
            </>
          )}
        </div>

        {/* Hidden Audio Element */}
        <audio ref={audioRef} aria-hidden="true" />
      </div>
    </>
  )
}
