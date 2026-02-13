import { useState, useEffect, useRef } from 'react'
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
  const [currentPlaying, setCurrentPlaying] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState({})
  const [nextStoryTime, setNextStoryTime] = useState(12)

  // Enhanced audio controls
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [volume, setVolume] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [sleepTimer, setSleepTimer] = useState(null)
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState(0)

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedDialect, setSelectedDialect] = useState('All') // NEW: Dialect filter
  const [sortBy, setSortBy] = useState('title') // Changed to 'title' for A to Z by default
  const [showSearchBar, setShowSearchBar] = useState(false)
  const [filteredStories, setFilteredStories] = useState([])

  // User states
  const [currentUser, setCurrentUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [userFavorites, setUserFavorites] = useState([])
  const [userHistory, setUserHistory] = useState([])

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
  const [showMiniPlayer, setShowMiniPlayer] = useState(true) // true = mini, false = full player

  const audioRef = useRef(null)
  const sleepTimerRef = useRef(null)

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

    // Load current user from localStorage
    const savedUser = localStorage.getItem('audioflix_current_user')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setCurrentUser(user)
      setUserFavorites(user.favorites || [])
      setUserHistory(user.history || [])
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveCount(c => c + 1)
      setGenerating(prev => !prev)
      setNextStoryTime(Math.floor(Math.random() * 15) + 1)
    }, 8000)
    return () => clearInterval(timer)
  }, [])

  // Hero carousel auto-rotation - 2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (filteredStories.length > 0) {
        setHeroIndex((prev) => (prev + 1) % Math.min(filteredStories.length, 5))
      }
    }, 2000) // Change every 2 seconds
    return () => clearInterval(timer)
  }, [filteredStories])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const playStory = async (story) => {
    setCurrentPlaying(story)

    // Add to history if user is logged in
    addToHistory(story.id)

    // Check if story has pre-generated audio
    if (story.generated && (story.audioPath || story.audioUrl)) {
      const audio = audioRef.current
      // Force reload audio by pausing, resetting, and loading new src
      audio.pause()
      audio.currentTime = 0
      audio.src = story.audioPath || story.audioUrl
      audio.load() // Force reload from src
      audio.play().catch(err => console.error('Audio play error:', err))
      setIsPlaying(true)
      return
    }

    // If not generated, show message
    alert(`Story "${story.title}" is not ready yet!\n\nPlease run: npm run generate\n\nThis will pre-generate all stories with AI.`)
    setCurrentPlaying(null)
  }

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const seekTo = (e) => {
    const audio = audioRef.current
    const progressBar = e.currentTarget
    const rect = progressBar.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    audio.currentTime = percentage * audio.duration
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Enhanced audio controls
  const changePlaybackSpeed = (speed) => {
    const audio = audioRef.current
    if (audio) {
      audio.playbackRate = speed
      setPlaybackSpeed(speed)
      setShowSpeedMenu(false)
    }
  }

  const changeVolume = (newVolume) => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = newVolume
      setVolume(newVolume)
    }
  }

  const skipForward = () => {
    const audio = audioRef.current
    if (!audio || !audio.src) {
      console.warn('⚠️ No audio loaded')
      return
    }

    const wasPlaying = !audio.paused
    const currentPosition = audio.currentTime || 0
    const targetTime = Math.min(currentPosition + 10, (audio.duration || 0) - 1)

    console.log(`⏩ Forward: ${currentPosition.toFixed(2)}s → ${targetTime.toFixed(2)}s`)

    // Seek completed handler
    const handleSeeked = () => {
      audio.removeEventListener('seeked', handleSeeked)
      if (wasPlaying) {
        audio.play().catch(err => console.error('Play error:', err))
        setIsPlaying(true)
      }
      console.log(`✓ Seeked to ${audio.currentTime.toFixed(2)}s`)
    }

    // Add seeked event listener
    audio.addEventListener('seeked', handleSeeked)

    // Pause and seek
    if (wasPlaying) {
      audio.pause()
      setIsPlaying(false)
    }

    // Perform the seek
    try {
      audio.currentTime = targetTime
    } catch (err) {
      console.error('Seek error:', err)
      audio.removeEventListener('seeked', handleSeeked)
      if (wasPlaying) {
        audio.play()
        setIsPlaying(true)
      }
    }
  }

  const skipBackward = () => {
    const audio = audioRef.current
    if (!audio || !audio.src) {
      console.warn('⚠️ No audio loaded')
      return
    }

    const wasPlaying = !audio.paused
    const currentPosition = audio.currentTime || 0
    const targetTime = Math.max(currentPosition - 10, 0)

    console.log(`⏪ Backward: ${currentPosition.toFixed(2)}s → ${targetTime.toFixed(2)}s`)

    // Seek completed handler
    const handleSeeked = () => {
      audio.removeEventListener('seeked', handleSeeked)
      if (wasPlaying) {
        audio.play().catch(err => console.error('Play error:', err))
        setIsPlaying(true)
      }
      console.log(`✓ Seeked to ${audio.currentTime.toFixed(2)}s`)
    }

    // Add seeked event listener
    audio.addEventListener('seeked', handleSeeked)

    // Pause and seek
    if (wasPlaying) {
      audio.pause()
      setIsPlaying(false)
    }

    // Perform the seek
    try {
      audio.currentTime = targetTime
    } catch (err) {
      console.error('Seek error:', err)
      audio.removeEventListener('seeked', handleSeeked)
      if (wasPlaying) {
        audio.play()
        setIsPlaying(true)
      }
    }
  }

  const setSleepTimerFunc = (minutes) => {
    // Clear existing timer
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current)
    }

    if (minutes === 0) {
      setSleepTimer(null)
      setSleepTimerMinutes(0)
      return
    }

    setSleepTimerMinutes(minutes)
    const endTime = Date.now() + minutes * 60 * 1000

    // Update timer every second
    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000 / 60))
      setSleepTimer(remaining)

      if (remaining <= 0) {
        const audio = audioRef.current
        if (audio) {
          audio.pause()
          setIsPlaying(false)
        }
        setSleepTimerMinutes(0)
      } else {
        sleepTimerRef.current = setTimeout(updateTimer, 1000)
      }
    }

    updateTimer()
  }

  // User functions
  const handleLogin = (user) => {
    setCurrentUser(user)
    setUserFavorites(user.favorites || [])
    setUserHistory(user.history || [])
  }

  const handleLogout = () => {
    localStorage.removeItem('audioflix_current_user')
    setCurrentUser(null)
    setUserFavorites([])
    setUserHistory([])
  }

  const toggleFavorite = (storyId) => {
    if (!currentUser) {
      setShowAuthModal(true)
      return
    }

    const newFavorites = userFavorites.includes(storyId)
      ? userFavorites.filter(id => id !== storyId)
      : [...userFavorites, storyId]

    setUserFavorites(newFavorites)

    // Update user in localStorage
    const users = JSON.parse(localStorage.getItem('audioflix_users') || '[]')
    const userIndex = users.findIndex(u => u.id === currentUser.id)
    if (userIndex !== -1) {
      users[userIndex].favorites = newFavorites
      localStorage.setItem('audioflix_users', JSON.stringify(users))
      localStorage.setItem('audioflix_current_user', JSON.stringify(users[userIndex]))
    }
  }

  const addToHistory = (storyId) => {
    if (!currentUser) return

    const newHistory = [storyId, ...userHistory.filter(id => id !== storyId)].slice(0, 50)
    setUserHistory(newHistory)

    // Update user in localStorage
    const users = JSON.parse(localStorage.getItem('audioflix_users') || '[]')
    const userIndex = users.findIndex(u => u.id === currentUser.id)
    if (userIndex !== -1) {
      users[userIndex].history = newHistory
      localStorage.setItem('audioflix_users', JSON.stringify(users))
      localStorage.setItem('audioflix_current_user', JSON.stringify(users[userIndex]))
    }
  }

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
      <header role="banner" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'15px 40px',background:isDarkMode ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',position:'sticky',top:0,zIndex:100,borderBottom:`1px solid ${currentTheme.border}`,backdropFilter:'blur(10px)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'20px'}}>
          {/* Logo */}
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <img
              src="/stage-logo.png"
              alt="Stage FM - Audio Stories Platform"
              style={{height:'45px',width:'auto'}}
            />
            <span style={{
              fontSize:'32px',
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
                  whiteSpace: 'nowrap'
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
        <div style={{display:'flex',gap:'15px',alignItems:'center'}}>
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
            style={{fontSize:'24px',cursor:'pointer',transition:'all 0.2s'}}
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
              <div style={{fontSize:'14px',color:'#ccc',cursor:'pointer'}}>
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
        <div style={{
          background:'rgba(0,0,0,0.95)',
          padding:'20px 40px',
          borderBottom:'1px solid #333',
          position:'sticky',
          top:'72px',
          zIndex:99
        }}>
          <div style={{
            display:'flex',
            gap:'15px',
            alignItems:'center',
            maxWidth:'1200px',
            margin:'0 auto'
          }}>
            {/* Search Input */}
            <div style={{flex:1,position:'relative',display:'flex',alignItems:'center'}}>
              <input
                type="text"
                placeholder="Search stories by title or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width:'100%',
                  padding:'14px 50px 14px 20px',
                  background:'#2a2a2a',
                  border:'2px solid #667eea',
                  borderRadius:'25px',
                  color:'white',
                  fontSize:'15px',
                  outline:'none',
                  boxSizing:'border-box'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position:'absolute',
                    right:'18px',
                    top:'50%',
                    transform:'translateY(-50%)',
                    background:'rgba(255,255,255,0.1)',
                    border:'none',
                    borderRadius:'50%',
                    width:'28px',
                    height:'28px',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    color:'#aaa',
                    cursor:'pointer',
                    fontSize:'16px',
                    transition:'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                    e.currentTarget.style.color = 'white'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.color = '#aaa'
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter - Hidden for now */}
            {false && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding:'12px 15px',
                  background:'#2a2a2a',
                  border:'2px solid #667eea',
                  borderRadius:'25px',
                  color:'white',
                  fontSize:'14px',
                  cursor:'pointer',
                  outline:'none'
                }}
              >
                <option value="All">All Categories</option>
                <option value="Romance">💕 Romance</option>
                <option value="Horror">👻 Horror</option>
                <option value="Thriller">🔪 Thriller</option>
                <option value="Comedy">😂 Comedy</option>
                <option value="Spiritual">🙏 Spiritual</option>
                <option value="Motivation">💪 Motivation</option>
              </select>
            )}

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding:'12px 15px',
                background:'#2a2a2a',
                border:'2px solid #667eea',
                borderRadius:'25px',
                color:'white',
                fontSize:'14px',
                cursor:'pointer',
                outline:'none'
              }}
            >
              <option value="latest">⏰ Latest First</option>
              <option value="title">🔤 A-Z</option>
            </select>

            {/* Results Count */}
            <div style={{
              padding:'8px 15px',
              background:'rgba(16, 185, 129, 0.2)',
              borderRadius:'20px',
              fontSize:'13px',
              fontWeight:'bold',
              color:'#10b981',
              whiteSpace:'nowrap'
            }}>
              {filteredStories.length} stories
            </div>
          </div>
        </div>
      )}

      {/* Auto-Playing Hero Carousel - Rotates every 2 seconds */}
      {filteredStories.length > 0 && (
        <div style={{
          height:'600px',
          position:'relative',
          overflow:'hidden',
          backgroundImage: filteredStories[heroIndex]?.thumbnailUrl
            ? `url(${filteredStories[heroIndex].thumbnailUrl})`
            : `linear-gradient(135deg, #${((filteredStories[heroIndex]?.id * 123456) % 0xFFFFFF).toString(16).padStart(6, '0')}, #${((filteredStories[heroIndex]?.id * 654321) % 0xFFFFFF).toString(16).padStart(6, '0')})`,
          backgroundSize:'cover',
          backgroundPosition:'center',
          backgroundRepeat:'no-repeat',
          transition:'background-image 0.8s ease-in-out'
        }}>
          {/* Black Gradient Overlay - Feathers from left */}
          <div style={{
            position:'absolute',
            top:0,
            left:0,
            right:0,
            bottom:0,
            background:'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.4) 60%, transparent 100%)',
            zIndex:1
          }} />

          {/* Text Content - Positioned on left over gradient */}
          <div style={{
            position:'absolute',
            top:0,
            left:0,
            bottom:0,
            display:'flex',
            alignItems:'center',
            padding:'0 60px',
            zIndex:2,
            maxWidth:'55%'
          }}>
            <div style={{maxWidth:'600px'}}>
              <div style={{display:'flex',gap:'12px',marginBottom:'15px',flexWrap:'wrap'}}>
                {filteredStories[heroIndex]?.new && (
                  <span style={{background:'#e50914',padding:'6px 14px',borderRadius:'20px',fontSize:'12px',fontWeight:'bold',color:'white'}}>NEW</span>
                )}
                {storyRatings[filteredStories[heroIndex]?.id]?.average > 0 && (
                  <span style={{background:'rgba(0,0,0,0.6)',padding:'6px 14px',borderRadius:'20px',fontSize:'12px',color:'white',backdropFilter:'blur(10px)'}}>
                    ⭐ {storyRatings[filteredStories[heroIndex]?.id].average.toFixed(1)}
                  </span>
                )}
                <span style={{background:'rgba(0,0,0,0.6)',padding:'6px 14px',borderRadius:'20px',fontSize:'12px',color:'white',backdropFilter:'blur(10px)'}}>
                  {filteredStories[heroIndex]?.category}
                </span>
                <span style={{background:'rgba(0,0,0,0.6)',padding:'6px 14px',borderRadius:'20px',fontSize:'12px',color:'white',backdropFilter:'blur(10px)'}}>
                  ⏱️ {filteredStories[heroIndex]?.duration || '5-15 min'}
                </span>
              </div>

              <h2 style={{
                fontSize:'56px',
                margin:'0 0 20px',
                fontWeight:'bold',
                textShadow:'2px 2px 10px rgba(0,0,0,0.8)',
                color:'white',
                animation:'fadeIn 0.6s ease-in'
              }}>
                {filteredStories[heroIndex]?.emoji} {filteredStories[heroIndex]?.title}
              </h2>

              <p style={{
                fontSize:'18px',
                marginBottom:'30px',
                lineHeight:'1.6',
                textShadow:'1px 1px 5px rgba(0,0,0,0.8)',
                color:'rgba(255,255,255,0.95)',
                display:'-webkit-box',
                WebkitLineClamp:3,
                WebkitBoxOrient:'vertical',
                overflow:'hidden'
              }}>
                {filteredStories[heroIndex]?.description || filteredStories[heroIndex]?.prompt || 'An amazing audio story waiting for you to discover. Experience immersive storytelling with professional narration.'}
              </p>

              <div style={{display:'flex',gap:'15px'}}>
                <button
                  onClick={() => playStory(filteredStories[heroIndex])}
                  style={{
                    background:'white',
                    color:'black',
                    border:'none',
                    padding:'15px 45px',
                    fontSize:'18px',
                    fontWeight:'bold',
                    borderRadius:'6px',
                    cursor:'pointer',
                    display:'flex',
                    alignItems:'center',
                    gap:'10px',
                    boxShadow:'0 4px 15px rgba(0,0,0,0.3)',
                    transition:'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  ▶️ Play Now
                </button>

                <button
                  onClick={() => router.push(`/story/${filteredStories[heroIndex]?.id}`)}
                  style={{
                    background:'rgba(109, 109, 110, 0.7)',
                    color:'white',
                    border:'2px solid white',
                    padding:'15px 35px',
                    fontSize:'18px',
                    fontWeight:'bold',
                    borderRadius:'6px',
                    cursor:'pointer',
                    display:'flex',
                    alignItems:'center',
                    gap:'10px',
                    backdropFilter:'blur(10px)',
                    transition:'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(109, 109, 110, 0.9)'
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(109, 109, 110, 0.7)'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  ℹ️ More Info
                </button>
              </div>
            </div>
          </div>

          {/* Slide Indicators */}
          <div style={{
            position:'absolute',
            bottom:'30px',
            left:'50%',
            transform:'translateX(-50%)',
            display:'flex',
            gap:'8px',
            zIndex:3
          }}>
            {filteredStories.slice(0, 5).map((_, idx) => (
              <div
                key={idx}
                onClick={() => setHeroIndex(idx)}
                style={{
                  width: idx === heroIndex ? '32px' : '10px',
                  height:'10px',
                  borderRadius:'5px',
                  background: idx === heroIndex ? 'white' : 'rgba(255,255,255,0.5)',
                  cursor:'pointer',
                  transition:'all 0.3s ease'
                }}
              />
            ))}
          </div>
        </div>
      )}

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
      <div style={{padding:'30px 40px 100px',maxWidth:'1600px',margin:'0 auto'}}>

        {/* Stories Grid - Flat layout matching reference */}
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))',
          gap:'20px',
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
      {!showMiniPlayer && currentPlaying && (
        <div style={{
          position:'fixed',
          bottom:0,
          left:0,
          right:0,
          background:'linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.98))',
          padding:'20px 40px',
          borderTop:'1px solid #333',
          zIndex:1001,
          backdropFilter:'blur(10px)'
        }}>
          {/* Close Button */}
          <button
            onClick={() => {
              audioRef.current.pause()
              setCurrentPlaying(null)
              setIsPlaying(false)
            }}
            style={{
              position:'absolute',
              top:'15px',
              right:'15px',
              background:'rgba(255,255,255,0.1)',
              border:'none',
              borderRadius:'50%',
              width:'32px',
              height:'32px',
              fontSize:'18px',
              cursor:'pointer',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              color:'white',
              transition:'all 0.2s'
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
          <div style={{display:'flex',alignItems:'center',gap:'20px'}}>
            <div style={{
              fontSize:'60px',
              minWidth:'80px',
              textAlign:'center',
              background:'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius:'12px',
              padding:'10px'
            }}>
              {currentPlaying.emoji}
            </div>
            <div style={{flex:1}}>
              <div style={{fontWeight:'bold',fontSize:'18px',marginBottom:'5px'}}>
                {currentPlaying.title}
              </div>
              <div style={{fontSize:'14px',color:'#aaa',marginBottom:'10px',display:'flex',gap:'10px',alignItems:'center'}}>
                <span>{currentPlaying.category}</span>
                <span>•</span>
                <span style={{color:'#10b981'}}>⏱️ {formatTime(duration)}</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'20px'}}>
                {/* Skip Backward 10s */}
                <button
                  onClick={skipBackward}
                  style={{
                    background:'rgba(255,255,255,0.1)',
                    border:'none',
                    borderRadius:'50%',
                    width:'40px',
                    height:'40px',
                    fontSize:'16px',
                    cursor:'pointer',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    color:'white',
                    transition:'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  title="Rewind 10s"
                >
                  ⏪
                </button>

                {/* Play/Pause */}
                <button onClick={togglePlayPause} style={{
                  background:'#10b981',
                  border:'none',
                  borderRadius:'50%',
                  width:'55px',
                  height:'55px',
                  fontSize:'26px',
                  cursor:'pointer',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  transition:'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {isPlaying ? '⏸️' : '▶️'}
                </button>

                {/* Skip Forward 10s */}
                <button
                  onClick={skipForward}
                  style={{
                    background:'rgba(255,255,255,0.1)',
                    border:'none',
                    borderRadius:'50%',
                    width:'40px',
                    height:'40px',
                    fontSize:'16px',
                    cursor:'pointer',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    color:'white',
                    transition:'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  title="Forward 10s"
                >
                  ⏩
                </button>

                {/* Progress Bar */}
                <div style={{flex:1}}>
                  <div
                    onClick={seekTo}
                    style={{
                      height:'6px',
                      background:'#333',
                      borderRadius:'3px',
                      overflow:'hidden',
                      marginBottom:'5px',
                      cursor:'pointer',
                      position:'relative'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.height = '8px'}
                    onMouseLeave={(e) => e.currentTarget.style.height = '6px'}
                  >
                    <div style={{
                      height:'100%',
                      width:`${duration ? (currentTime/duration)*100 : 0}%`,
                      background:'linear-gradient(90deg, #10b981, #3b82f6)',
                      transition:'width 0.1s linear'
                    }}/>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',color:'#aaa',fontWeight:'500'}}>
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Volume Control */}
                <div style={{position:'relative'}}>
                  <button
                    onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                    style={{
                      background:'none',
                      border:'none',
                      color:'white',
                      cursor:'pointer',
                      fontSize:'22px',
                      padding:'5px'
                    }}
                    title="Volume"
                  >
                    {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
                  </button>
                  {showVolumeSlider && (
                    <div style={{
                      position:'absolute',
                      bottom:'45px',
                      left:'50%',
                      transform:'translateX(-50%)',
                      background:'rgba(0,0,0,0.95)',
                      padding:'15px 10px',
                      borderRadius:'10px',
                      border:'1px solid #333'
                    }}>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => changeVolume(parseFloat(e.target.value))}
                        style={{
                          width:'80px',
                          transform:'rotate(-90deg)',
                          transformOrigin:'center',
                          margin:'30px 0'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Playback Speed */}
                <div style={{position:'relative'}}>
                  <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    style={{
                      background:'rgba(255,255,255,0.1)',
                      border:'1px solid #666',
                      borderRadius:'8px',
                      padding:'6px 12px',
                      color:'white',
                      cursor:'pointer',
                      fontSize:'13px',
                      fontWeight:'bold'
                    }}
                    title="Playback Speed"
                  >
                    {playbackSpeed}x
                  </button>
                  {showSpeedMenu && (
                    <div style={{
                      position:'absolute',
                      bottom:'45px',
                      left:'50%',
                      transform:'translateX(-50%)',
                      background:'rgba(0,0,0,0.95)',
                      borderRadius:'10px',
                      border:'1px solid #333',
                      overflow:'hidden',
                      minWidth:'100px'
                    }}>
                      {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(speed => (
                        <button
                          key={speed}
                          onClick={() => changePlaybackSpeed(speed)}
                          style={{
                            width:'100%',
                            padding:'10px 15px',
                            background: speed === playbackSpeed ? '#10b981' : 'transparent',
                            border:'none',
                            color:'white',
                            cursor:'pointer',
                            fontSize:'14px',
                            textAlign:'center'
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
                <div style={{position:'relative'}}>
                  <button
                    style={{
                      background: sleepTimer ? '#10b981' : 'none',
                      border:'none',
                      color:'white',
                      cursor:'pointer',
                      fontSize:'22px',
                      padding:'5px',
                      position:'relative'
                    }}
                    onClick={() => {
                      const minutes = prompt('Sleep timer (minutes):\n\n15 - 15 minutes\n30 - 30 minutes\n45 - 45 minutes\n60 - 1 hour\n0 - Cancel timer', sleepTimerMinutes || '30')
                      if (minutes !== null) {
                        setSleepTimerFunc(parseInt(minutes) || 0)
                      }
                    }}
                    title={sleepTimer ? `Sleep timer: ${sleepTimer} min` : 'Set sleep timer'}
                  >
                    ⏰
                    {sleepTimer > 0 && (
                      <span style={{
                        position:'absolute',
                        top:'-5px',
                        right:'-5px',
                        background:'#e50914',
                        borderRadius:'50%',
                        padding:'2px 6px',
                        fontSize:'10px',
                        fontWeight:'bold'
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
      )}

      {/* Mini Player */}
      {showMiniPlayer && (
        <MiniPlayer
          currentPlaying={currentPlaying}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onPlayPause={togglePlayPause}
          onClose={() => {
            audioRef.current.pause()
            setCurrentPlaying(null)
            setIsPlaying(false)
          }}
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

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          h1 {
            font-size: 24px !important;
          }
          .header {
            padding: 10px 20px !important;
            flex-wrap: wrap;
          }
          .header-buttons {
            font-size: 11px !important;
            padding: 6px 12px !important;
          }
          .hero-banner {
            height: 300px !important;
            padding: 20px !important;
          }
          .hero-title {
            font-size: 28px !important;
          }
          .story-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
            gap: 15px !important;
            padding: 0 20px !important;
          }
          .audio-player {
            padding: 15px 20px !important;
          }
          .generation-indicator {
            bottom: 15px !important;
            right: 15px !important;
            min-width: 200px !important;
            padding: 15px !important;
          }
        }

        @media (max-width: 480px) {
          h1 {
            font-size: 20px !important;
          }
          .story-grid {
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)) !important;
            gap: 10px !important;
            padding: 0 15px !important;
          }
          .hero-banner {
            height: 250px !important;
          }
          .hero-title {
            font-size: 24px !important;
          }
        }

        /* Smooth transitions */
        * {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
    </>
  )
}
