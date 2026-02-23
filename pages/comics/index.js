import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTheme } from '../../contexts/ThemeContext'
import ThemeToggle from '../../components/ThemeToggle'
import ComicStoryCard from '../../components/comics/ComicStoryCard'
import Loading from '../../components/Loading'

export default function ComicsListingPage() {
  const router = useRouter()
  const { isDarkMode, currentTheme } = useTheme()
  const [comics, setComics] = useState([])
  const [filteredComics, setFilteredComics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedDialect, setSelectedDialect] = useState('All')

  useEffect(() => {
    setLoading(true)
    fetch('/api/comics/stories')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setComics(data.comics)
          setFilteredComics(data.comics)
        } else {
          setError('Failed to load comics')
        }
      })
      .catch(err => {
        console.error('Failed to load comics:', err)
        setError('Network error. Please check your connection.')
      })
      .finally(() => setLoading(false))
  }, [])

  // Filter effect
  useEffect(() => {
    let result = [...comics]
    if (selectedCategory !== 'All') {
      result = result.filter(c => c.category === selectedCategory)
    }
    if (selectedDialect !== 'All') {
      result = result.filter(c => (c.language || c.dialect) === selectedDialect)
    }
    setFilteredComics(result)
  }, [selectedCategory, selectedDialect, comics])

  const categories = ['All', ...new Set(comics.map(c => c.category))]
  const dialects = [
    { value: 'All', label: 'All', emoji: '🌐', color: '#ec4899' },
    { value: 'Hindi', label: 'Hindi', emoji: '🇮🇳', color: '#667eea' },
    { value: 'Rajasthani', label: 'Rajasthani', emoji: '🏜️', color: '#8b5cf6' },
    { value: 'Bhojpuri', label: 'Bhojpuri', emoji: '🎪', color: '#10b981' },
  ]

  return (
    <>
      <Head>
        <title>Visual Comics - Stage FM | Illustrated Hindi Stories</title>
        <meta name="description" content="Read visual comic stories in Hindi and regional dialects. Illustrated panels with speech bubbles, narration, and optional audio." />
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
                background: 'linear-gradient(135deg, #ec4899, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Visual Comics
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
            background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(245,158,11,0.15))',
            borderRadius: '20px',
            padding: 'clamp(24px, 4vw, 40px)',
            marginBottom: '30px',
            border: `1px solid ${isDarkMode ? 'rgba(236,72,153,0.2)' : 'rgba(236,72,153,0.1)'}`,
          }}>
            <div style={{
              fontSize: '40px',
              marginBottom: '12px',
            }}>
              📚
            </div>
            <h1 style={{
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: '900',
              marginBottom: '8px',
              lineHeight: '1.2',
            }}>
              Visual Comic Stories
            </h1>
            <p style={{
              fontSize: 'clamp(14px, 2vw, 16px)',
              color: isDarkMode ? '#aaa' : '#666',
              maxWidth: '500px',
              lineHeight: '1.6',
            }}>
              Illustrated stories in Hindi and regional dialects. Swipe through panels with speech bubbles, narration captions, and optional audio narration!
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
            {/* Dialect Filter */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {dialects.map(d => (
                <button
                  key={d.value}
                  onClick={() => setSelectedDialect(d.value)}
                  aria-label={`Filter: ${d.label}`}
                  aria-pressed={selectedDialect === d.value}
                  style={{
                    padding: '6px 14px',
                    background: selectedDialect === d.value
                      ? d.color
                      : isDarkMode ? '#2a2a2a' : '#f5f5f5',
                    color: selectedDialect === d.value
                      ? 'white'
                      : currentTheme.text,
                    border: `2px solid ${selectedDialect === d.value ? d.color : 'transparent'}`,
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    transform: selectedDialect === d.value ? 'scale(1.05)' : 'scale(1)',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{d.emoji}</span> {d.label}
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
                        ? '#ec4899'
                        : isDarkMode ? '#2a2a2a' : '#f5f5f5',
                      color: selectedCategory === cat
                        ? 'white'
                        : currentTheme.text,
                      border: `2px solid ${selectedCategory === cat ? '#ec4899' : 'transparent'}`,
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
          {loading && <Loading message="Loading comics..." />}

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

          {/* Comics Grid */}
          {!loading && !error && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 'clamp(8px, 2vw, 20px)',
            }}>
              {filteredComics.map(comic => (
                <ComicStoryCard key={comic.id} story={comic} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredComics.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#666' }}>
              <div style={{ fontSize: '60px', marginBottom: '20px' }}>📚</div>
              <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px', color: currentTheme.text }}>
                No comics found
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
