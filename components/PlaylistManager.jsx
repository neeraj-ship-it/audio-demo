import { useState, useEffect, useCallback } from 'react'

export default function PlaylistManager({
  isOpen,
  onClose,
  currentUser,
  stories,
  storyToAdd,
  onPlayPlaylist
}) {
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [expandedPlaylistId, setExpandedPlaylistId] = useState(null)
  const [savingPlaylistId, setSavingPlaylistId] = useState(null)

  const fetchPlaylists = useCallback(async () => {
    if (!currentUser?.id) return
    setLoading(true)
    try {
      const res = await fetch('/api/playlists', {
        headers: { 'x-user-id': currentUser.id }
      })
      const data = await res.json()
      if (data.success) {
        setPlaylists(data.playlists)
      }
    } catch (error) {
      console.error('Failed to fetch playlists:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUser?.id])

  useEffect(() => {
    if (isOpen && currentUser?.id) {
      fetchPlaylists()
    }
  }, [isOpen, currentUser?.id, fetchPlaylists])

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return
    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({
          name: newPlaylistName.trim(),
          description: '',
          storyIds: []
        })
      })
      const data = await res.json()
      if (data.success) {
        setPlaylists(prev => [...prev, data.playlist])
        setNewPlaylistName('')
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('Failed to create playlist:', error)
    }
  }

  const handleDeletePlaylist = async (playlistId) => {
    try {
      const res = await fetch('/api/playlists', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ playlistId })
      })
      const data = await res.json()
      if (data.success) {
        setPlaylists(prev => prev.filter(p => p.id !== playlistId))
        if (expandedPlaylistId === playlistId) {
          setExpandedPlaylistId(null)
        }
      }
    } catch (error) {
      console.error('Failed to delete playlist:', error)
    }
  }

  const handleToggleStoryInPlaylist = async (playlist) => {
    if (!storyToAdd) return
    setSavingPlaylistId(playlist.id)

    const hasStory = playlist.storyIds.includes(storyToAdd)
    const updatedStoryIds = hasStory
      ? playlist.storyIds.filter(id => id !== storyToAdd)
      : [...playlist.storyIds, storyToAdd]

    try {
      const res = await fetch('/api/playlists', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({
          playlistId: playlist.id,
          storyIds: updatedStoryIds
        })
      })
      const data = await res.json()
      if (data.success) {
        setPlaylists(prev =>
          prev.map(p => p.id === playlist.id ? data.playlist : p)
        )
      }
    } catch (error) {
      console.error('Failed to update playlist:', error)
    } finally {
      setSavingPlaylistId(null)
    }
  }

  const getStoryTitle = (storyId) => {
    const story = (stories || []).find(s => s.id === storyId)
    return story ? story.title : `Story #${storyId}`
  }

  if (!isOpen) return null

  const isAddMode = storyToAdd !== undefined && storyToAdd !== null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1a1a1a',
          borderRadius: '15px',
          padding: 'clamp(20px, 3vw, 30px)',
          maxWidth: '550px',
          width: '100%',
          maxHeight: '90vh',
          maxHeight: '90dvh',
          overflow: 'auto',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none',
            border: 'none',
            color: '#aaa',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>

        {/* Header */}
        <h2 style={{ margin: '0 0 5px 0', fontSize: '22px', color: 'white' }}>
          {isAddMode ? 'Add to Playlist' : 'My Playlists'}
        </h2>
        {isAddMode && (
          <p style={{ color: '#aaa', fontSize: '14px', margin: '0 0 20px 0' }}>
            Select playlists to add this story to
          </p>
        )}
        {!isAddMode && (
          <p style={{ color: '#aaa', fontSize: '14px', margin: '0 0 20px 0' }}>
            Manage your story playlists
          </p>
        )}

        {/* Create Playlist Button / Form */}
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '20px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            + Create Playlist
          </button>
        ) : (
          <div style={{
            background: '#2a2a2a',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '20px',
            border: '1px solid #333'
          }}>
            <input
              type="text"
              placeholder="Playlist name..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreatePlaylist()
                if (e.key === 'Escape') {
                  setShowCreateForm(false)
                  setNewPlaylistName('')
                }
              }}
              autoFocus
              style={{
                width: '100%',
                padding: '12px',
                background: '#1a1a1a',
                border: '2px solid #444',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                marginBottom: '12px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistName.trim()}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: newPlaylistName.trim()
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: newPlaylistName.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false)
                  setNewPlaylistName('')
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'transparent',
                  border: '1px solid #555',
                  borderRadius: '8px',
                  color: '#aaa',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '30px', color: '#aaa' }}>
            Loading playlists...
          </div>
        )}

        {/* Empty State */}
        {!loading && playlists.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#666'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>
              &#127925;
            </div>
            <p style={{ fontSize: '16px', margin: '0 0 8px 0', color: '#aaa' }}>
              No playlists yet
            </p>
            <p style={{ fontSize: '14px', margin: 0 }}>
              Create your first playlist to organize your favorite stories
            </p>
          </div>
        )}

        {/* Playlist List */}
        {!loading && playlists.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {playlists.map((playlist) => {
              const isExpanded = expandedPlaylistId === playlist.id
              const hasStoryToAdd = isAddMode && playlist.storyIds.includes(storyToAdd)

              return (
                <div
                  key={playlist.id}
                  style={{
                    background: '#2a2a2a',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: hasStoryToAdd ? '1px solid #10b981' : '1px solid #333',
                    transition: 'border-color 0.2s'
                  }}
                >
                  {/* Playlist Row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      gap: '12px'
                    }}
                    onClick={() => {
                      if (isAddMode) {
                        handleToggleStoryInPlaylist(playlist)
                      } else {
                        setExpandedPlaylistId(isExpanded ? null : playlist.id)
                      }
                    }}
                  >
                    {/* Checkbox (Add Mode) */}
                    {isAddMode && (
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '4px',
                        border: hasStoryToAdd ? '2px solid #10b981' : '2px solid #555',
                        background: hasStoryToAdd ? '#10b981' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.2s',
                        opacity: savingPlaylistId === playlist.id ? 0.5 : 1
                      }}>
                        {hasStoryToAdd && (
                          <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                            &#10003;
                          </span>
                        )}
                      </div>
                    )}

                    {/* Playlist Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: 'white',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {playlist.name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>
                        {playlist.storyIds.length} {playlist.storyIds.length === 1 ? 'story' : 'stories'}
                        {playlist.description ? ` - ${playlist.description}` : ''}
                      </div>
                    </div>

                    {/* Actions (non-add mode) */}
                    {!isAddMode && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {/* Play Button */}
                        {playlist.storyIds.length > 0 && onPlayPlaylist && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onPlayPlaylist(playlist.storyIds)
                            }}
                            title="Play playlist"
                            style={{
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: 'white',
                              fontSize: '14px',
                              flexShrink: 0
                            }}
                          >
                            &#9654;
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeletePlaylist(playlist.id)
                          }}
                          title="Delete playlist"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#666',
                            fontSize: '18px',
                            cursor: 'pointer',
                            padding: '4px',
                            lineHeight: 1,
                            flexShrink: 0
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                        >
                          &#128465;
                        </button>

                        {/* Expand Arrow */}
                        <span style={{
                          color: '#666',
                          fontSize: '12px',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s',
                          display: 'inline-block'
                        }}>
                          &#9660;
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Expanded Story List (non-add mode) */}
                  {!isAddMode && isExpanded && (
                    <div style={{
                      borderTop: '1px solid #333',
                      padding: '12px 16px',
                      background: '#222'
                    }}>
                      {playlist.storyIds.length === 0 ? (
                        <p style={{
                          color: '#666',
                          fontSize: '13px',
                          margin: 0,
                          textAlign: 'center',
                          padding: '10px 0'
                        }}>
                          No stories in this playlist yet
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {playlist.storyIds.map((storyId, idx) => (
                            <div
                              key={storyId}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '8px 10px',
                                background: '#2a2a2a',
                                borderRadius: '6px',
                                fontSize: '14px'
                              }}
                            >
                              <span style={{ color: '#667eea', fontWeight: 'bold', fontSize: '12px', minWidth: '20px' }}>
                                {idx + 1}.
                              </span>
                              <span style={{ color: '#ddd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {getStoryTitle(storyId)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
