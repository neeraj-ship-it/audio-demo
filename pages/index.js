import { useState, useEffect, useRef, useCallback } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import ComingSoon from '../components/ComingSoon'
import Categories from '../components/Categories'
import Loading from '../components/Loading'
import ErrorBoundary from '../components/ErrorBoundary'
import UserAuth from '../components/UserAuth'
import RatingModal from '../components/RatingModal'
import ShareModal from '../components/ShareModal'
import MiniPlayer from '../components/MiniPlayer'
import ThemeToggle from '../components/ThemeToggle'
import StoryCard from '../components/StoryCard'
import HeroCarousel from '../components/HeroCarousel'
import AudioPlayer from '../components/AudioPlayer'
import SearchBar from '../components/SearchBar'
import PlaylistManager from '../components/PlaylistManager'
import useAudio from '../hooks/useAudio'
import useUser from '../hooks/useUser'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'

export default function AudioFlix() {
  const router = useRouter()
  const { isDarkMode, toggleTheme, currentTheme } = useTheme()
  const toast = useToast()
  const [stories, setStories] = useState([])
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [liveCount, setLiveCount] = useState(247)
  const [generating, setGenerating] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [nextStoryTime, setNextStoryTime] = useState(12)

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedDialect, setSelectedDialect] = useState('All')
  const [sortBy, setSortBy] = useState('title')
  const [showSearchBar, setShowSearchBar] = useState(false)
  const [filteredStories, setFilteredStories] = useState([])

  // User hook - consolidates user state, auth, favorites, and history
  const { currentUser, showAuthModal, setShowAuthModal, userFavorites, userHistory, setUserHistory, handleLogin, handleLogout, toggleFavorite } = useUser()

  // Content Discovery states
  const [heroIndex, setHeroIndex] = useState(0)
  const [trendingStories, setTrendingStories] = useState([])

  // Rating states
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [ratingStory, setRatingStory] = useState(null)
  const [storyRatings, setStoryRatings] = useState({})

  // Share states
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareStory, setShareStory] = useState(null)

  // Mini Player state
  const [showMiniPlayer, setShowMiniPlayer] = useState(true)

  // Playlist state
  const [showPlaylistManager, setShowPlaylistManager] = useState(false)
  const [playlistStoryToAdd, setPlaylistStoryToAdd] = useState(null)

  // addToHistory callback for the audio hook
  const addToHistory = useCallback((storyId) => {
    if (!currentUser) return
    setUserHistory(prev => {
      const newHistory = [storyId, ...prev.filter(id => id !== storyId)].slice(0, 50)
      const users = JSON.parse(localStorage.getItem('audioflix_users') || '[]')
      const userIndex = users.findIndex(u => u.id === currentUser.id)
      if (userIndex !== -1) {
        users[userIndex].history = newHistory
        localStorage.setItem('audioflix_users', JSON.stringify(users))
        localStorage.setItem('audioflix_current_user', JSON.stringify(users[userIndex]))
      }
      return newHistory
    })
  }, [currentUser])

  // Audio hook - replaces 10+ useState, 2 useRef, audio event useEffect, and all audio functions
  const {
    currentPlaying, isPlaying, currentTime, duration,
    playbackSpeed, volume, sleepTimer, sleepTimerMinutes,
    showSpeedMenu, setShowSpeedMenu, showVolumeSlider, setShowVolumeSlider,
    audioRef,
    playStory, togglePlayPause, seekTo, formatTime,
    changePlaybackSpeed, changeVolume, skipForward, skipBackward,
    setSleepTimerFunc, closePlayer,
  } = useAudio({ onAddToHistory: addToHistory })

  useEffect(() => {
    // Load published content from API
    setLoading(true)
    fetch('/api/content/published')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStories(data.content)
          setFilteredStories(data.content)
          setLiveCount(data.total)
          setError(null)
        } else {
          setError('Failed to load stories')
        }
      })
      .catch(err => {
        console.error('Failed to load stories:', err)
        setError('Network error. Please check your connection.')
      })
      .finally(() => setLoading(false))
  }, [])

  // Search & Filter effect
  useEffect(() => {
    let result = [...stories]

    // Apply search filter
    if (searchQuery.trim()) {
      result = result.filter(story =>
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      result = result.filter(story => story.category === selectedCategory)
    }

    // Apply dialect filter - NEW!
    if (selectedDialect !== 'All') {
      result = result.filter(story => story.language === selectedDialect)
    }

    // Apply sorting
    switch (sortBy) {
      case 'latest':
        result.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt))
        break
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'category':
        result.sort((a, b) => a.category.localeCompare(b.category))
        break
      default:
        break
    }

    setFilteredStories(result)
  }, [searchQuery, selectedCategory, selectedDialect, sortBy, stories])

  useEffect(() => {
    // Set random time on client side only
    setNextStoryTime(Math.floor(Math.random() * 15) + 1)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveCount(c => c + 1)
      setGenerating(prev => !prev)
      setNextStoryTime(Math.floor(Math.random() * 15) + 1)
    }, 8000)
    return () => clearInterval(timer)
  }, [])

  const openRatingModal = (story, e) => {
    e.stopPropagation()
    setRatingStory(story)
    setShowRatingModal(true)
  }

  const closeRatingModal = () => {
    setShowRatingModal(false)
    setRatingStory(null)
    // Refresh ratings after modal closes
    loadStoryRatings()
  }

  const openShareModal = (story, e) => {
    e.stopPropagation()
    setShareStory(story)
    setShowShareModal(true)
  }

  const closeShareModal = () => {
    setShowShareModal(false)
    setShareStory(null)
  }

  const loadStoryRatings = async () => {
    // Load ratings for all stories
    const ratingsMap = {}
    for (const story of stories) {
      try {
        const res = await fetch(`/api/ratings/${story.id}`)
        const data = await res.json()
        if (data.success) {
          ratingsMap[story.id] = {
            average: data.average,
            total: data.total
          }
        }
      } catch (err) {
        console.error(`Failed to load ratings for story ${story.id}`)
      }
    }
    setStoryRatings(ratingsMap)
  }

  // Load ratings when stories change
  useEffect(() => {
    if (stories.length > 0) {
      loadStoryRatings()
    }
  }, [stories])

  // Calculate trending stories based on ratings
  useEffect(() => {
    if (Object.keys(storyRatings).length > 0 && stories.length > 0) {
      const storiesWithRatings = stories
        .map(story => ({
          ...story,
          rating: storyRatings[story.id] || { average: 0, total: 0 }
        }))
        .filter(story => story.rating.total > 0)
        .sort((a, b) => {
          // Sort by rating average, then by total count
          if (b.rating.average !== a.rating.average) {
            return b.rating.average - a.rating.average
          }
          return b.rating.total - a.rating.total
        })
        .slice(0, 6)

      setTrendingStories(storiesWithRatings)
    }
  }, [storyRatings, stories])

  // Keyboard shortcuts for audio control
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return

      switch (e.key) {
        case ' ': // Space = play/pause
          e.preventDefault()
          if (currentPlaying) togglePlayPause()
          break
        case 'ArrowRight': // → = skip forward 10s
          if (currentPlaying) skipForward()
          break
        case 'ArrowLeft': // ← = skip backward 10s
          if (currentPlaying) skipBackward()
          break
        case 'ArrowUp': // ↑ = volume up
          e.preventDefault()
          changeVolume(Math.min(1, volume + 0.1))
          break
        case 'ArrowDown': // ↓ = volume down
          e.preventDefault()
          changeVolume(Math.max(0, volume - 0.1))
          break
        case 'm': // M = mute/unmute
          changeVolume(volume === 0 ? 1 : 0)
          break
        case 'Escape': // Escape = close modals
          if (showRatingModal) closeRatingModal()
          if (showShareModal) closeShareModal()
          if (showAuthModal) setShowAuthModal(false)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPlaying, isPlaying, volume, showRatingModal, showShareModal, showAuthModal])

  const categories = ['🔥 Trending', '💕 Romance', '🎭 Drama', '🚀 Tech', '💪 Health', '🙏 Spiritual']

  return (
    <>
    <Head>
      <title>Stage FM - Hindi Audio Stories | Romance, Thriller, Comedy & More</title>
      <meta name="description" content="Listen to premium Hindi audio stories in Bhojpuri, Gujarati, Haryanvi, and Rajasthani dialects. Multi-voice AI narration with background music." />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content={currentTheme.bg} />
      <link rel="icon" href="/favicon.ico" />
      <html lang="hi" />
    </Head>
    <div style={{background:currentTheme.bg,minHeight:'100vh',color:currentTheme.text,fontFamily:'system-ui, -apple-system, sans-serif',margin:0,padding:0,transition:'background 0.3s ease, color 0.3s ease'}}>
      {/* Skip to content link for keyboard navigation */}
      <a href="#main-content" style={{position:'absolute',top:'-40px',left:0,background:'#667eea',color:'white',padding:'8px 16px',zIndex:9999,fontSize:'14px',textDecoration:'none',borderRadius:'0 0 4px 0'}} onFocus={(e)=>e.currentTarget.style.top='0'} onBlur={(e)=>e.currentTarget.style.top='-40px'}>
        Skip to content
      </a>

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Header */}
      <header role="banner" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'15px 40px',background:isDarkMode ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',position:'sticky',top:0,zIndex:100,borderBottom:`1px solid ${currentTheme.border}`,backdropFilter:'blur(10px)',flexWrap:'wrap',gap:'10px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'clamp(10px, 2vw, 20px)',flexWrap:'wrap'}}>
          {/* Logo */}
          <div className="header-logo" style={{display:'flex',alignItems:'center',gap:'10px',flexShrink:0}}>
            <img
              src="/stage-logo.png"
              alt="Stage FM - Audio Stories Platform"
              style={{height:'clamp(30px, 5vw, 45px)',width:'auto'}}
            />
            <span className="fm-text" style={{
              fontSize:'clamp(22px, 3vw, 32px)',
              fontWeight:'900',
              background:'linear-gradient(135deg, #e50914, #ff6b6b)',
              WebkitBackgroundClip:'text',
              WebkitTextFillColor:'transparent',
              letterSpacing:'2px'
            }}>
              FM
            </span>
          </div>

          {/* Dialect Buttons */}
          <nav aria-label="Filter by dialect" style={{display:'flex',gap:'8px',alignItems:'center',borderLeft:`2px solid ${currentTheme.border}`,paddingLeft:'20px'}}>
            {[
              {value: 'All', emoji: '🌐', color: '#667eea'},
              {value: 'Haryanvi', emoji: '🎭', color: '#ff6b6b'},
              {value: 'Gujarati', emoji: '🎨', color: '#f59e0b'},
              {value: 'Bhojpuri', emoji: '🎪', color: '#10b981'},
              {value: 'Rajasthani', emoji: '🏜️', color: '#8b5cf6'}
            ].map(dialect => (
              <button
                key={dialect.value}
                onClick={() => setSelectedDialect(dialect.value)}
                aria-label={`Filter: ${dialect.value}`}
                aria-pressed={selectedDialect === dialect.value}
                style={{
                  padding: '6px 14px',
                  background: selectedDialect === dialect.value
                    ? dialect.color
                    : isDarkMode ? '#2a2a2a' : '#f5f5f5',
                  color: selectedDialect === dialect.value
                    ? 'white'
                    : currentTheme.text,
                  border: `2px solid ${selectedDialect === dialect.value ? dialect.color : 'transparent'}`,
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  transform: selectedDialect === dialect.value ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: selectedDialect === dialect.value
                    ? `0 2px 10px ${dialect.color}60`
                    : 'none',
                  whiteSpace: 'nowrap',
                  minHeight: '44px'
                }}
                onMouseEnter={(e) => {
                  if (selectedDialect !== dialect.value) {
                    e.currentTarget.style.background = isDarkMode ? '#3a3a3a' : '#e5e5e5'
                    e.currentTarget.style.transform = 'scale(1.03)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedDialect !== dialect.value) {
                    e.currentTarget.style.background = isDarkMode ? '#2a2a2a' : '#f5f5f5'
                    e.currentTarget.style.transform = 'scale(1)'
                  }
                }}
              >
                <span style={{fontSize: '16px'}}>{dialect.emoji}</span>
                <span>{dialect.value}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="header-right" style={{display:'flex',gap:'clamp(8px, 1.5vw, 15px)',alignItems:'center',flexShrink:0}}>
          {/* Categories button - Hidden for now */}
          {false && (
            <button onClick={() => {
              setShowCategories(!showCategories)
              setShowComingSoon(false)
            }} style={{
              background:showCategories ? '#667eea' : '#2a2a2a',
              color:'white',
              border:'1px solid #667eea',
              padding:'8px 18px',
              borderRadius:'25px',
              fontSize:'13px',
              fontWeight:'bold',
              cursor:'pointer',
              display:'flex',
              alignItems:'center',
              gap:'8px'
            }}>
              <span>📂</span> Categories
            </button>
          )}
          {/* Coming Soon button - Hidden for now */}
          {false && (
            <button onClick={() => {
              setShowComingSoon(!showComingSoon)
              setShowCategories(false)
            }} style={{
              background:showComingSoon ? '#667eea' : '#2a2a2a',
              color:'white',
              border:'1px solid #667eea',
              padding:'8px 18px',
              borderRadius:'25px',
              fontSize:'13px',
              fontWeight:'bold',
              cursor:'pointer',
              display:'flex',
              alignItems:'center',
              gap:'8px'
            }}>
              <span>📅</span> Coming Soon
            </button>
          )}
          <div
            onClick={() => setShowSearchBar(!showSearchBar)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowSearchBar(!showSearchBar) }}}
            aria-label="Toggle search"
            style={{fontSize:'24px',cursor:'pointer',transition:'all 0.2s',minWidth:'44px',minHeight:'44px',display:'flex',alignItems:'center',justifyContent:'center'}}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            🔍
          </div>
          {currentUser ? (
            <div style={{position:'relative',display:'flex',alignItems:'center',gap:'10px'}}>
              <div style={{
                background:'linear-gradient(135deg, #667eea, #764ba2)',
                width:'35px',
                height:'35px',
                borderRadius:'50%',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                fontSize:'16px',
                fontWeight:'bold',
                cursor:'pointer'
              }}>
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="user-name" style={{fontSize:'14px',color:'#ccc',cursor:'pointer'}}>
                {currentUser.name}
              </div>
              <button
                onClick={handleLogout}
                style={{
                  background:'rgba(229, 9, 20, 0.2)',
                  border:'1px solid #e50914',
                  padding:'5px 12px',
                  borderRadius:'15px',
                  color:'#e50914',
                  fontSize:'12px',
                  cursor:'pointer',
                  fontWeight:'bold'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              style={{
                background:'linear-gradient(135deg, #667eea, #764ba2)',
                border:'none',
                padding:'8px 18px',
                borderRadius:'20px',
                color:'white',
                fontSize:'14px',
                fontWeight:'bold',
                cursor:'pointer',
                display:'flex',
                alignItems:'center',
                gap:'8px'
              }}
            >
              👤 Login
            </button>
          )}
        </div>
      </header>

      <main id="main-content" role="main">
      {/* Search Bar */}
      {showSearchBar && (
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          resultCount={filteredStories.length}
          stories={stories}
        />
      )}

      {/* Hero Carousel */}
      <HeroCarousel
        stories={filteredStories}
        heroIndex={heroIndex}
        setHeroIndex={setHeroIndex}
        storyRatings={storyRatings}
        onPlay={playStory}
        onMoreInfo={(story) => router.push(`/story/${story?.id}`)}
      />

      {/* Loading State */}
      {loading && (
        <Loading message="Loading your stories..." />
      )}

      {/* Error State */}
      {error && !loading && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>⚠️</div>
          <div style={{ fontSize: '20px', marginBottom: '10px', fontWeight: 'bold' }}>
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '10px 25px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            🔄 Retry
          </button>
        </div>
      )}

      {/* Content Section - Flat Grid with StoryCard */}
      {!loading && !error && showCategories ? (
        <Categories
          stories={stories}
          onStoryClick={playStory}
          currentPlaying={currentPlaying}
        />
      ) : !loading && !error && !showComingSoon && (
      <div className="content-grid-wrapper" style={{padding:'clamp(10px, 3vw, 30px) clamp(10px, 3vw, 40px) 100px',maxWidth:'1600px',margin:'0 auto'}}>

        {/* Stories Grid - Flat layout matching reference */}
        <div className="story-grid" style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))',
          gap:'clamp(8px, 2vw, 20px)',
        }}>
          {filteredStories.map(story => (
            <StoryCard
              key={story.id}
              story={story}
              isPlaying={currentPlaying?.id === story.id}
              storyRating={storyRatings[story.id]}
              isFavorite={userFavorites.includes(story.id)}
              onPlay={playStory}
              onShare={openShareModal}
              onRate={openRatingModal}
              onFavorite={toggleFavorite}
            />
          ))}
        </div>

        {filteredStories.length === 0 && (
          <div style={{textAlign:'center',padding:'80px 20px',color:'#666'}}>
            <div style={{fontSize:'60px',marginBottom:'20px'}}>🎧</div>
            <div style={{fontSize:'20px',fontWeight:'600',marginBottom:'10px',color:currentTheme.text}}>
              No stories found
            </div>
            <div style={{fontSize:'14px'}}>
              Try selecting a different dialect or search term
            </div>
          </div>
        )}
      </div>
      )}

      {/* Coming Soon Section */}
      {showComingSoon && <ComingSoon />}

      {/* Full Audio Player */}
      {!showMiniPlayer && (
        <AudioPlayer
          currentPlaying={currentPlaying}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          playbackSpeed={playbackSpeed}
          showVolumeSlider={showVolumeSlider}
          setShowVolumeSlider={setShowVolumeSlider}
          showSpeedMenu={showSpeedMenu}
          setShowSpeedMenu={setShowSpeedMenu}
          sleepTimer={sleepTimer}
          onPlayPause={togglePlayPause}
          onSkipForward={skipForward}
          onSkipBackward={skipBackward}
          onSeek={seekTo}
          onVolumeChange={changeVolume}
          onSpeedChange={changePlaybackSpeed}
          onSleepTimer={() => {
            const minutes = prompt('Sleep timer (minutes):\n\n15 - 15 minutes\n30 - 30 minutes\n45 - 45 minutes\n60 - 1 hour\n0 - Cancel timer', sleepTimerMinutes || '30')
            if (minutes !== null) setSleepTimerFunc(parseInt(minutes) || 0)
          }}
          onClose={closePlayer}
          formatTime={formatTime}
        />
      )}

      {/* Mini Player */}
      {showMiniPlayer && (
        <MiniPlayer
          currentPlaying={currentPlaying}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onPlayPause={togglePlayPause}
          onClose={closePlayer}
          onSkipForward={skipForward}
          onSkipBackward={skipBackward}
          formatTime={formatTime}
          userFavorites={userFavorites}
          toggleFavorite={toggleFavorite}
        />
      )}

      </main>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} aria-hidden="true" />

      {/* User Auth Modal */}
      {showAuthModal && (
        <UserAuth
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
        />
      )}

      {/* Rating Modal */}
      {showRatingModal && ratingStory && (
        <RatingModal
          story={ratingStory}
          currentUser={currentUser}
          onClose={closeRatingModal}
        />
      )}

      {/* Share Modal */}
      {showShareModal && shareStory && (
        <ShareModal
          story={shareStory}
          onClose={closeShareModal}
        />
      )}

      {/* Playlist Manager Modal */}
      <PlaylistManager
        isOpen={showPlaylistManager}
        onClose={() => { setShowPlaylistManager(false); setPlaylistStoryToAdd(null) }}
        currentUser={currentUser}
        stories={stories}
        storyToAdd={playlistStoryToAdd}
        onPlayPlaylist={(storyIds) => {
          const first = stories.find(s => s.id === storyIds[0])
          if (first) playStory(first)
          setShowPlaylistManager(false)
        }}
      />

      {/* Loading Overlay */}
      {isGenerating && (
        <div style={{
          position:'fixed',
          top:0,
          left:0,
          right:0,
          bottom:0,
          background:'rgba(0,0,0,0.9)',
          display:'flex',
          flexDirection:'column',
          alignItems:'center',
          justifyContent:'center',
          zIndex:9999
        }}>
          <div style={{fontSize:'80px',marginBottom:'20px',animation:'spin 2s linear infinite'}}>
            ⚙️
          </div>
          <div style={{fontSize:'24px',fontWeight:'bold',marginBottom:'10px'}}>
            AI Content Generation Active
          </div>
          <div style={{fontSize:'16px',color:'#aaa',marginBottom:'20px'}}>
            Creating story with Gemini AI...
          </div>
          <div style={{fontSize:'16px',color:'#aaa'}}>
            Generating emotional voice with ElevenLabs...
          </div>
          <div style={{marginTop:'30px',fontSize:'14px',color:'#666'}}>
            This may take 10-30 seconds
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Smooth transitions - only for color and background */
        a, button, input, select {
          transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
        }
      `}</style>
    </div>
    </>
  )
}
