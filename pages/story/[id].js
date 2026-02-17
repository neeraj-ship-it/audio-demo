import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import fs from 'fs'
import path from 'path'
import ShareModal from '../../components/ShareModal'

const SITE_URL = 'https://audio-demo-eight.vercel.app'

export async function getServerSideProps({ params }) {
  const { id } = params

  // Read static stories
  const dbPath = path.join(process.cwd(), 'data', 'stories.json')
  const data = JSON.parse(await fs.promises.readFile(dbPath, 'utf8'))
  const allStories = data.stories || []

  // Also try S3 live stories
  let liveStories = []
  try {
    const { readLiveStories } = require('../../lib/s3-storage')
    liveStories = await readLiveStories()
  } catch (e) { /* ignore */ }

  const merged = [...liveStories, ...allStories]
  const story = merged.find(s => String(s.id) === String(id)) || null

  if (!story) {
    return { props: { story: null, ogData: null } }
  }

  // Build absolute thumbnail URL for OG
  let ogImage = `${SITE_URL}/stage-logo.png`
  if (story.thumbnailUrl) {
    let thumbUrl = story.thumbnailUrl.startsWith('http')
      ? story.thumbnailUrl
      : `${SITE_URL}${story.thumbnailUrl}`
    // Presign S3 thumbnail URLs so they're accessible
    if (thumbUrl.includes('.s3.') || thumbUrl.includes('amazonaws.com')) {
      try {
        const { getPresignedUrl } = require('../../lib/s3-storage')
        thumbUrl = getPresignedUrl(thumbUrl)
      } catch (e) { /* fallback to logo */ }
    }
    ogImage = thumbUrl
  }

  const ogData = {
    title: `${story.title} - STAGE fm`,
    description: (story.description || '').substring(0, 200),
    image: ogImage,
    url: `${SITE_URL}/story/${id}`,
    category: story.category || '',
    dialect: story.dialect || ''
  }

  // Serialize only what client needs (strip huge script field)
  const clientStory = {
    id: story.id,
    title: story.title,
    description: story.description,
    category: story.category,
    language: story.language,
    dialect: story.dialect,
    emoji: story.emoji,
    duration: story.duration,
    audioUrl: story.audioUrl || story.audioPath,
    thumbnailUrl: story.thumbnailUrl,
    generated: story.generated,
    generatedAt: story.generatedAt
  }

  return { props: { story: clientStory, ogData } }
}

export default function StoryDetails({ story: serverStory, ogData }) {
  const router = useRouter()
  const { id } = router.query

  const [story, setStory] = useState(serverStory)
  const [relatedStories, setRelatedStories] = useState([])
  const [ratings, setRatings] = useState({ average: 0, total: 0, reviews: [] })
  const [loading, setLoading] = useState(!serverStory)
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    if (!id) return

    // Fetch full story data from API (includes presigned audio URLs)
    fetch('/api/content/published')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const foundStory = data.content.find(s => String(s.id) === String(id))
          if (foundStory) {
            setStory(foundStory)
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
        if (data.success) setRatings(data.ratings)
      })
      .catch(err => console.error('Error loading ratings:', err))
  }, [id])

  const formatDuration = (dur) => {
    if (!dur) return '5-15 min'
    if (typeof dur === 'string') return dur
    const mins = Math.floor(dur / 60)
    return `${mins} min`
  }

  const handleShare = async () => {
    const url = `${SITE_URL}/story/${story.id}`
    const text = `${story.emoji} "${story.title}" - ${story.category} | STAGE fm`

    // Try native Web Share API first (mobile)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: story.title, text, url })
        return
      } catch (e) {
        // User cancelled or not supported, fall through to modal
        if (e.name === 'AbortError') return
      }
    }

    // Fallback: show ShareModal (desktop)
    setShowShareModal(true)
  }

  if (loading && !story) {
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
        <title>{ogData?.title || `${story.title} - STAGE fm`}</title>
        <meta name="description" content={ogData?.description || story.description} />
        <link rel="canonical" href={ogData?.url || `${SITE_URL}/story/${story.id}`} />

        {/* OG Tags */}
        <meta property="og:title" content={ogData?.title || story.title} />
        <meta property="og:description" content={ogData?.description || story.description} />
        <meta property="og:image" content={ogData?.image || `${SITE_URL}/stage-logo.png`} />
        <meta property="og:url" content={ogData?.url || `${SITE_URL}/story/${story.id}`} />
        <meta property="og:type" content="article" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogData?.title || story.title} />
        <meta name="twitter:description" content={ogData?.description || story.description} />
        <meta name="twitter:image" content={ogData?.image || `${SITE_URL}/stage-logo.png`} />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {/* Header */}
        <div style={{
          padding: '15px 20px',
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
          <div style={{width: '80px'}} />
        </div>

        {/* Hero Section - Full Width */}
        <div style={{
          position: 'relative',
          width: '100%',
          minHeight: '50vh',
          maxHeight: '500px',
          background: story.thumbnailUrl
            ? `url(${story.thumbnailUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, #${((story.id * 123456) % 0xFFFFFF).toString(16).padStart(6, '0')}, #${((story.id * 654321) % 0xFFFFFF).toString(16).padStart(6, '0')})`,
          display: 'flex',
          alignItems: 'flex-end'
        }}>
          {/* Gradient Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, #0a0a0a 0%, rgba(10,10,10,0.6) 50%, transparent 100%)'
          }} />

          {/* Story Info */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            padding: 'clamp(20px, 5vw, 40px)',
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px'}}>
              <span style={{
                display: 'inline-block',
                background: 'rgba(102, 126, 234, 0.3)',
                border: '1px solid #667eea',
                borderRadius: '20px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#667eea'
              }}>
                {story.category}
              </span>
              {story.dialect && (
                <span style={{
                  display: 'inline-block',
                  background: 'rgba(251, 191, 36, 0.2)',
                  border: '1px solid #fbbf24',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#fbbf24'
                }}>
                  {story.language || story.dialect}
                </span>
              )}
            </div>

            <h1 style={{
              fontSize: 'clamp(28px, 6vw, 48px)',
              fontWeight: 'bold',
              margin: '0 0 16px 0',
              textShadow: '0 4px 12px rgba(0,0,0,0.8)',
              lineHeight: 1.2
            }}>
              {story.emoji} {story.title}
            </h1>

            <div style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
              fontSize: '14px',
              color: '#aaa',
              marginBottom: '20px',
              flexWrap: 'wrap'
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
                ❤️ Favorites
              </button>

              <button
                onClick={handleShare}
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
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: 'clamp(20px, 5vw, 40px) clamp(16px, 5vw, 40px) 120px'
        }}>
          {/* Description Section */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: 'clamp(20px, 4vw, 32px)',
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
              lineHeight: '1.8',
              color: '#ccc'
            }}>
              {story.description || 'A captivating audio story that will keep you engaged from start to finish.'}
            </p>

            {/* Story Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '16px',
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
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px'
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
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{
                      width: '100%',
                      height: '240px',
                      background: relatedStory.thumbnailUrl
                        ? `url(${relatedStory.thumbnailUrl}) center/cover`
                        : `linear-gradient(135deg, #${((relatedStory.id * 123456) % 0xFFFFFF).toString(16).padStart(6, '0')}, #${((relatedStory.id * 654321) % 0xFFFFFF).toString(16).padStart(6, '0')})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '60px'
                    }}>
                      {!relatedStory.thumbnailUrl && relatedStory.emoji}
                    </div>
                    <div style={{padding: '14px'}}>
                      <div style={{
                        fontWeight: 'bold',
                        fontSize: '15px',
                        marginBottom: '6px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {relatedStory.emoji} {relatedStory.title}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#aaa',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span>{relatedStory.category}</span>
                        <span>{relatedStory.dialect}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ShareModal Fallback (desktop) */}
      {showShareModal && (
        <ShareModal story={story} onClose={() => setShowShareModal(false)} />
      )}
    </>
  )
}
