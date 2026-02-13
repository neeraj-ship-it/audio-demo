import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function StoryDetails() {
  const router = useRouter()
  const { id } = router.query

  const [story, setStory] = useState(null)
  const [relatedStories, setRelatedStories] = useState([])
  const [ratings, setRatings] = useState({ average: 0, total: 0, reviews: [] })
  const [loading, setLoading] = useState(true)
  const [showShareMenu, setShowShareMenu] = useState(false)

  useEffect(() => {
    if (!id) return

    setLoading(true)

    // Fetch story details
    fetch('/api/content/published')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const foundStory = data.content.find(s => s.id === parseInt(id))
          setStory(foundStory)

          // Get related stories (same category, different id)
          if (foundStory) {
            const related = data.content
              .filter(s => s.category === foundStory.category && s.id !== foundStory.id)
              .slice(0, 4)
            setRelatedStories(related)
          }
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading story:', err)
        setLoading(false)
      })

    // Fetch ratings
    fetch(`/api/ratings/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRatings(data.ratings)
        }
      })
      .catch(err => console.error('Error loading ratings:', err))
  }, [id])

  const formatDuration = (seconds) => {
    if (!seconds) return '5-15 min'
    const mins = Math.floor(seconds / 60)
    return `${mins} min`
  }

  const shareStory = (platform) => {
    const url = `${window.location.origin}/story/${story.id}`
    const text = `Check out this story: ${story.title}`

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      copy: url
    }

    if (platform === 'copy') {
      navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    }
    setShowShareMenu(false)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{fontSize: '48px', animation: 'spin 2s linear infinite'}}>⚙️</div>
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!story) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{fontSize: '64px', marginBottom: '20px'}}>😕</div>
        <h1>Story Not Found</h1>
        <p style={{color: '#aaa', marginBottom: '20px'}}>The story you're looking for doesn't exist.</p>
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            border: 'none',
            borderRadius: '25px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          ← Back to Home
        </button>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{story.title} - STAGE fm</title>
        <meta name="description" content={story.description || story.prompt} />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {/* Header */}
        <div style={{
          padding: '15px 40px',
          background: 'rgba(0,0,0,0.9)',
          borderBottom: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(10px)'
        }}>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '25px',
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: 'bold',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ← Back
          </button>
          <h1 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #e50914, #ff6b6b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🎵 STAGE fm
          </h1>
          <div style={{width: '80px'}} /> {/* Spacer for centering */}
        </div>

        {/* Hero Section */}
        <div style={{
          position: 'relative',
          height: '400px',
          background: story.thumbnailUrl
            ? `url(${story.thumbnailUrl}) center/cover`
            : `linear-gradient(135deg, #${((story.id * 123456) % 0xFFFFFF).toString(16).padStart(6, '0')}, #${((story.id * 654321) % 0xFFFFFF).toString(16).padStart(6, '0')})`,
          display: 'flex',
          alignItems: 'flex-end'
        }}>
          {/* Gradient Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 100%)'
          }} />

          {/* Story Info */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            padding: '40px',
            width: '100%'
          }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(102, 126, 234, 0.3)',
              border: '1px solid #667eea',
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#667eea',
              marginBottom: '12px'
            }}>
              {story.category}
            </div>

            <h1 style={{
              fontSize: '48px',
              fontWeight: 'bold',
              margin: '0 0 16px 0',
              textShadow: '0 4px 12px rgba(0,0,0,0.8)'
            }}>
              {story.emoji} {story.title}
            </h1>

            <div style={{
              display: 'flex',
              gap: '24px',
              alignItems: 'center',
              fontSize: '14px',
              color: '#aaa',
              marginBottom: '20px'
            }}>
              <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                ⏱️ {formatDuration(story.duration)}
              </span>
              <span>•</span>
              <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                ⭐ {ratings.average > 0 ? ratings.average.toFixed(1) : 'No ratings'}
              </span>
              {ratings.total > 0 && (
                <>
                  <span>•</span>
                  <span>{ratings.total} {ratings.total === 1 ? 'rating' : 'ratings'}</span>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
              <button
                onClick={() => router.push(`/?play=${story.id}`)}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #34d399)',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '12px 28px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                ▶️ Play Now
              </button>

              <button
                onClick={() => {/* Add to favorites logic */}}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '25px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                ❤️ Add to Favorites
              </button>

              <div style={{position: 'relative'}}>
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '25px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  📤 Share
                </button>

                {/* Share Menu */}
                {showShareMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '8px',
                    background: 'rgba(17, 24, 39, 0.98)',
                    borderRadius: '12px',
                    padding: '8px',
                    minWidth: '160px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    zIndex: 1000
                  }}>
                    <button
                      onClick={() => shareStory('whatsapp')}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        padding: '10px',
                        textAlign: 'left',
                        color: 'white',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      💬 WhatsApp
                    </button>
                    <button
                      onClick={() => shareStory('twitter')}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        padding: '10px',
                        textAlign: 'left',
                        color: 'white',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      🐦 Twitter
                    </button>
                    <button
                      onClick={() => shareStory('facebook')}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        padding: '10px',
                        textAlign: 'left',
                        color: 'white',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      📘 Facebook
                    </button>
                    <button
                      onClick={() => shareStory('copy')}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        padding: '10px',
                        textAlign: 'left',
                        color: 'white',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      📋 Copy Link
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 40px 120px'
        }}>
          {/* Description Section */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '40px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '16px'
            }}>
              About This Story
            </h2>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#ccc'
            }}>
              {story.description || story.prompt || 'A captivating audio story that will keep you engaged from start to finish.'}
            </p>

            {/* Story Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '20px',
              marginTop: '32px'
            }}>
              <div style={{
                background: 'rgba(102, 126, 234, 0.1)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                border: '1px solid rgba(102, 126, 234, 0.3)'
              }}>
                <div style={{fontSize: '32px', marginBottom: '8px'}}>⏱️</div>
                <div style={{fontSize: '14px', color: '#aaa'}}>Duration</div>
                <div style={{fontSize: '18px', fontWeight: 'bold', marginTop: '4px'}}>
                  {formatDuration(story.duration)}
                </div>
              </div>

              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                <div style={{fontSize: '32px', marginBottom: '8px'}}>⭐</div>
                <div style={{fontSize: '14px', color: '#aaa'}}>Rating</div>
                <div style={{fontSize: '18px', fontWeight: 'bold', marginTop: '4px'}}>
                  {ratings.average > 0 ? ratings.average.toFixed(1) : 'N/A'}
                </div>
              </div>

              <div style={{
                background: 'rgba(245, 87, 108, 0.1)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                border: '1px solid rgba(245, 87, 108, 0.3)'
              }}>
                <div style={{fontSize: '32px', marginBottom: '8px'}}>📊</div>
                <div style={{fontSize: '14px', color: '#aaa'}}>Reviews</div>
                <div style={{fontSize: '18px', fontWeight: 'bold', marginTop: '4px'}}>
                  {ratings.total}
                </div>
              </div>

              <div style={{
                background: 'rgba(251, 191, 36, 0.1)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                border: '1px solid rgba(251, 191, 36, 0.3)'
              }}>
                <div style={{fontSize: '32px', marginBottom: '8px'}}>📂</div>
                <div style={{fontSize: '14px', color: '#aaa'}}>Category</div>
                <div style={{fontSize: '18px', fontWeight: 'bold', marginTop: '4px'}}>
                  {story.category}
                </div>
              </div>
            </div>
          </div>

          {/* Related Stories */}
          {relatedStories.length > 0 && (
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '24px'
              }}>
                More Like This
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '20px'
              }}>
                {relatedStories.map(relatedStory => (
                  <div
                    key={relatedStory.id}
                    onClick={() => router.push(`/story/${relatedStory.id}`)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      transition: 'transform 0.3s ease',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{
                      width: '100%',
                      height: '280px',
                      background: relatedStory.thumbnailUrl
                        ? `url(${relatedStory.thumbnailUrl}) center/cover`
                        : `linear-gradient(135deg, #${((relatedStory.id * 123456) % 0xFFFFFF).toString(16).padStart(6, '0')}, #${((relatedStory.id * 654321) % 0xFFFFFF).toString(16).padStart(6, '0')})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '80px'
                    }}>
                      {!relatedStory.thumbnailUrl && relatedStory.emoji}
                    </div>
                    <div style={{padding: '16px'}}>
                      <div style={{
                        fontWeight: 'bold',
                        fontSize: '16px',
                        marginBottom: '8px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {relatedStory.title}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#aaa'
                      }}>
                        {relatedStory.category}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
