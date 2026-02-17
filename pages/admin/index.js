import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminDashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [stories, setStories] = useState([])
  const [stats, setStats] = useState({ total: 0, staticCount: 0, liveCount: 0 })
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState(null)
  const [filter, setFilter] = useState('all') // all, static, live

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/')
      return
    }
    if (user?.role === 'admin') {
      fetchStories()
    }
  }, [user, authLoading])

  const getAuthHeaders = () => {
    const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))
    const tokenValue = token ? token.split('=')[1] : ''
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenValue}`
    }
  }

  const fetchStories = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/stories', { headers: getAuthHeaders() })
      const data = await res.json()
      if (data.success) {
        setStories(data.stories)
        setStats({ total: data.total, staticCount: data.staticCount, liveCount: data.liveCount })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load stories' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (storyId, source) => {
    if (!confirm('Are you sure you want to remove this story?')) return

    try {
      const res = await fetch('/api/admin/stories', {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ storyId, source })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        fetchStories()
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Delete failed' })
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/stories', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({})
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: `Generated: ${data.message}` })
        fetchStories()
      } else {
        setMessage({ type: 'error', text: data.error || 'Generation failed' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Generation failed: ' + err.message })
    } finally {
      setGenerating(false)
    }
  }

  const filteredStories = filter === 'all'
    ? stories
    : stories.filter(s => s.source === filter)

  if (authLoading) {
    return <div style={{minHeight: '100vh', background: '#0a0a0a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Loading...</div>
  }

  if (!user || user.role !== 'admin') {
    return <div style={{minHeight: '100vh', background: '#0a0a0a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Access Denied</div>
  }

  return (
    <>
      <Head>
        <title>Admin - STAGE fm</title>
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
          zIndex: 100
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
              cursor: 'pointer'
            }}
          >
            ← Home
          </button>
          <h1 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #e50914, #ff6b6b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Admin Dashboard
          </h1>
          <div style={{fontSize: '13px', color: '#aaa'}}>{user.name}</div>
        </div>

        <div style={{maxWidth: '1200px', margin: '0 auto', padding: '24px 20px'}}>
          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <StatCard label="Total Stories" value={stats.total} color="#667eea" />
            <StatCard label="Static (JSON)" value={stats.staticCount} color="#10b981" />
            <StatCard label="Live (S3)" value={stats.liveCount} color="#f59e0b" />
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <button
              onClick={handleGenerate}
              disabled={generating}
              style={{
                background: generating ? '#555' : 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: 'white',
                cursor: generating ? 'wait' : 'pointer'
              }}
            >
              {generating ? 'Generating...' : '+ Generate New Story'}
            </button>

            <button onClick={fetchStories} style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '10px',
              padding: '12px 24px',
              fontSize: '14px',
              color: 'white',
              cursor: 'pointer'
            }}>
              Refresh
            </button>

            {/* Filter */}
            <div style={{display: 'flex', gap: '6px', marginLeft: 'auto'}}>
              {['all', 'static', 'live'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    background: filter === f ? '#667eea' : 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    color: 'white',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          {message && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              background: message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
              color: message.type === 'success' ? '#10b981' : '#ef4444',
              fontSize: '14px'
            }}>
              {message.text}
            </div>
          )}

          {/* Stories List */}
          {loading ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#aaa'}}>Loading stories...</div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
              {filteredStories.map(story => (
                <div key={story.id} style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}>
                  {/* Thumbnail */}
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '8px',
                    background: story.thumbnailUrl
                      ? `url(${story.thumbnailUrl}) center/cover`
                      : '#333',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    {!story.thumbnailUrl && (story.emoji || '🎵')}
                  </div>

                  {/* Info */}
                  <div style={{flex: 1, minWidth: 0}}>
                    <div style={{
                      fontWeight: 'bold',
                      fontSize: '14px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {story.emoji} {story.title}
                    </div>
                    <div style={{fontSize: '12px', color: '#aaa', display: 'flex', gap: '12px', marginTop: '4px'}}>
                      <span>{story.category}</span>
                      <span>{story.dialect}</span>
                      <span>{story.duration}</span>
                      <span style={{
                        color: story.source === 'live' ? '#f59e0b' : '#10b981',
                        fontWeight: 'bold'
                      }}>
                        {story.source}
                      </span>
                    </div>
                  </div>

                  {/* Date */}
                  <div style={{fontSize: '11px', color: '#666', flexShrink: 0, textAlign: 'right'}}>
                    {story.generatedAt ? new Date(story.generatedAt).toLocaleDateString() : 'N/A'}
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => window.open(`/story/${story.id}`, '_blank')}
                    style={{
                      background: 'rgba(102, 126, 234, 0.2)',
                      border: '1px solid #667eea',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      color: '#667eea',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(story.id, story.source)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid #ef4444',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      color: '#ef4444',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}

              {filteredStories.length === 0 && (
                <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
                  No stories found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: `rgba(${hexToRgb(color)}, 0.1)`,
      border: `1px solid ${color}40`,
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{fontSize: '32px', fontWeight: 'bold', color}}>{value}</div>
      <div style={{fontSize: '13px', color: '#aaa', marginTop: '4px'}}>{label}</div>
    </div>
  )
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}
