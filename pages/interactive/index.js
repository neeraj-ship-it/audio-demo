import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTheme } from '../../contexts/ThemeContext'
import ThemeToggle from '../../components/ThemeToggle'
import InteractiveStoryCard from '../../components/interactive/InteractiveStoryCard'
import Loading from '../../components/Loading'

export default function InteractiveStoriesPage() {
  const router = useRouter()
  const { isDarkMode, currentTheme } = useTheme()
  const [stories, setStories] = useState([])
  const [filteredStories, setFilteredStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')

  useEffect(() => {
    setLoading(true)
    fetch('/api/interactive/stories')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStories(data.stories)
          setFilteredStories(data.stories)
        } else {
          setError('Failed to load interactive stories')
        }
      })
      .catch(err => {
        console.error('Failed to load interactive stories:', err)
        setError('Network error. Please check your connection.')
      })
      .finally(() => setLoading(false))
  }, [])

  // Filter effect
  useEffect(() => {
    let result = [...stories]
    if (selectedCategory !== 'All') {
      result = result.filter(s => s.category === selectedCategory)
    }
    if (selectedDifficulty !== 'All') {
      result = result.filter(s => s.difficulty === selectedDifficulty)
    }
    setFilteredStories(result)
  }, [selectedCategory, selectedDifficulty, stories])

  const categories = ['All', ...new Set(stories.map(s => s.category))]
  const difficulties = [
    { value: 'All', label: 'All', color: '#667eea' },
    { value: 'easy', label: 'Easy', color: '#10b981' },
    { value: 'medium', label: 'Medium', color: '#f59e0b' },
    { value: 'hard', label: 'Hard', color: '#ef4444' },
  ]

  return (
    <>
      <Head>
        <title>Interactive Stories - Stage FM | Choose Your Adventure</title>
        <meta name="description" content="Play interactive Hindi audio stories. Make choices, change the story, discover multiple endings." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content={currentTheme.bg} />
      </Head>

      <div style={{
        background: currentTheme.bg,
        minHeight: '100vh',
        color: currentTheme.text,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        transition: 'background 0.3s ease, color 0.3s ease',
      }}>
        <ThemeToggle />

        {/* Header */}
        <header role="banner" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '15px 40px',
          background: isDarkMode ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          borderBottom: `1px solid ${currentTheme.border}`,
          backdropFilter: 'blur(10px)',
          flexWrap: 'wrap',
          gap: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Back to Home */}
            <button
              onClick={() => router.push('/')}
              aria-label="Back to home"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                color: currentTheme.text,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: '44px',
                minHeight: '44px',
                justifyContent: 'center',
              }}
            >
              {'\u2190'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src="/stage-logo.png"
                alt="Stage FM"
                style={{ height: 'clamp(30px, 5vw, 40px)', width: 'auto' }}
              />
              <span style={{
                fontSize: 'clamp(16px, 2.5vw, 22px)',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Interactive Stories
              </span>
            </div>
          </div>
        </header>

        <main id="main-content" role="main" style={{
          padding: 'clamp(15px, 3vw, 30px) clamp(15px, 3vw, 40px) 100px',
          maxWidth: '1600px',
          margin: '0 auto',
        }}>
          {/* Hero Section */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(102,126,234,0.15), rgba(118,75,162,0.15))',
            borderRadius: '20px',
            padding: 'clamp(24px, 4vw, 40px)',
            marginBottom: '30px',
            border: `1px solid ${isDarkMode ? 'rgba(102,126,234,0.2)' : 'rgba(102,126,234,0.1)'}`,
          }}>
            <div style={{
              fontSize: '40px',
              marginBottom: '12px',
            }}>
              🎮
            </div>
            <h1 style={{
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: '900',
              marginBottom: '8px',
              lineHeight: '1.2',
            }}>
              Choose Your Adventure
            </h1>
            <p style={{
              fontSize: 'clamp(14px, 2vw, 16px)',
              color: isDarkMode ? '#aaa' : '#666',
              maxWidth: '500px',
              lineHeight: '1.6',
            }}>
              Interactive Hindi stories where YOUR choices decide the ending. Multiple paths, multiple endings - play again to discover them all!
            </p>
          </div>

          {/* Filters */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}>
            {/* Difficulty Filter */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {difficulties.map(d => (
                <button
                  key={d.value}
                  onClick={() => setSelectedDifficulty(d.value)}
                  aria-label={`Filter: ${d.label}`}
                  aria-pressed={selectedDifficulty === d.value}
                  style={{
                    padding: '6px 14px',
                    background: selectedDifficulty === d.value
                      ? d.color
                      : isDarkMode ? '#2a2a2a' : '#f5f5f5',
                    color: selectedDifficulty === d.value
                      ? 'white'
                      : currentTheme.text,
                    border: `2px solid ${selectedDifficulty === d.value ? d.color : 'transparent'}`,
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    transform: selectedDifficulty === d.value ? 'scale(1.05)' : 'scale(1)',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            {categories.length > 1 && (
              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                borderLeft: `2px solid ${currentTheme.border}`,
                paddingLeft: '12px',
              }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    aria-pressed={selectedCategory === cat}
                    style={{
                      padding: '6px 14px',
                      background: selectedCategory === cat
                        ? '#667eea'
                        : isDarkMode ? '#2a2a2a' : '#f5f5f5',
                      color: selectedCategory === cat
                        ? 'white'
                        : currentTheme.text,
                      border: `2px solid ${selectedCategory === cat ? '#667eea' : 'transparent'}`,
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      minHeight: '44px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Loading */}
          {loading && <Loading message="Loading interactive stories..." />}

          {/* Error */}
          {error && !loading && (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: '60px', marginBottom: '20px' }}>⚠️</div>
              <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>{error}</div>
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
                  marginTop: '20px',
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Stories Grid */}
          {!loading && !error && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 'clamp(8px, 2vw, 20px)',
            }}>
              {filteredStories.map(story => (
                <InteractiveStoryCard key={story.id} story={story} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredStories.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#666' }}>
              <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎮</div>
              <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px', color: currentTheme.text }}>
                No interactive stories found
              </div>
              <div style={{ fontSize: '14px' }}>
                Try changing your filters
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
