import { useState, useEffect } from 'react'

export default function Categories({ stories, onStoryClick, currentPlaying }) {
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = [
    { name: 'All', emoji: '🎵', color: '#667eea' },
    { name: 'Romance', emoji: '💕', color: '#ff69b4' },
    { name: 'Horror', emoji: '👻', color: '#8b0000' },
    { name: 'Thriller', emoji: '🔪', color: '#4b0082' },
    { name: 'Comedy', emoji: '😂', color: '#ffd700' },
    { name: 'Spiritual', emoji: '🙏', color: '#9370db' },
    { name: 'Motivation', emoji: '💪', color: '#ff6347' }
  ]

  const filteredStories = selectedCategory === 'All'
    ? stories
    : stories.filter(s => s.category === selectedCategory)

  return (
    <div style={{padding:'0 40px'}}>
      {/* Category Filter */}
      <div style={{
        display:'flex',
        gap:'15px',
        overflowX:'auto',
        padding:'20px 0',
        marginBottom:'20px',
        borderBottom:'1px solid #333'
      }}>
        {categories.map(cat => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            style={{
              background: selectedCategory === cat.name ? cat.color : '#2a2a2a',
              color: 'white',
              border: selectedCategory === cat.name ? `2px solid ${cat.color}` : '1px solid #444',
              padding: '12px 24px',
              borderRadius: '25px',
              fontSize: '15px',
              fontWeight: selectedCategory === cat.name ? 'bold' : 'normal',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              boxShadow: selectedCategory === cat.name ? `0 0 20px ${cat.color}40` : 'none'
            }}
            onMouseEnter={(e) => {
              if (selectedCategory !== cat.name) {
                e.currentTarget.style.background = '#3a3a3a'
              }
            }}
            onMouseLeave={(e) => {
              if (selectedCategory !== cat.name) {
                e.currentTarget.style.background = '#2a2a2a'
              }
            }}
          >
            <span style={{fontSize:'20px'}}>{cat.emoji}</span>
            <span>{cat.name}</span>
            {cat.name !== 'All' && (
              <span style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '12px'
              }}>
                {stories.filter(s => s.category === cat.name).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Stories Grid */}
      <div>
        <h3 style={{
          fontSize: '24px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {categories.find(c => c.name === selectedCategory)?.emoji}
          {selectedCategory === 'All' ? 'All Stories' : selectedCategory}
          <span style={{fontSize:'16px',color:'#666'}}>
            ({filteredStories.length} stories)
          </span>
        </h3>

        {filteredStories.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            color: '#666'
          }}>
            <div style={{fontSize: '60px', marginBottom: '20px'}}>📭</div>
            <div style={{fontSize: '20px'}}>No stories in this category yet</div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            {filteredStories.map(story => (
              <div
                key={story.id}
                onClick={() => onStoryClick(story)}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  boxShadow: currentPlaying?.id === story.id
                    ? '0 0 30px #10b98180'
                    : '0 4px 12px rgba(0,0,0,0.5)',
                  border: currentPlaying?.id === story.id ? '3px solid #10b981' : 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05) translateY(-5px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.7)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) translateY(0)'
                  e.currentTarget.style.boxShadow = currentPlaying?.id === story.id
                    ? '0 0 30px #10b98180'
                    : '0 4px 12px rgba(0,0,0,0.5)'
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  width: '100%',
                  height: '280px',
                  background: story.thumbnailUrl
                    ? `url(${story.thumbnailUrl}) center/cover`
                    : `linear-gradient(135deg, #${((story.id * 123456) % 0xFFFFFF).toString(16).padStart(6, '0')}, #${((story.id * 654321) % 0xFFFFFF).toString(16).padStart(6, '0')})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '80px',
                  position: 'relative'
                }}>
                  {!story.thumbnailUrl && story.emoji}

                  {/* Playing Indicator */}
                  {currentPlaying?.id === story.id && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: 'rgba(16, 185, 129, 0.9)',
                      borderRadius: '50%',
                      width: '60px',
                      height: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      animation: 'pulse 1.5s infinite'
                    }}>
                      ▶️
                    </div>
                  )}

                  {/* NEW Badge */}
                  {story.new && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: '#e50914',
                      padding: '5px 12px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      NEW
                    </div>
                  )}

                  {/* Play Icon Overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    background: '#10b981',
                    padding: '8px',
                    borderRadius: '50%',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                    ▶️
                  </div>
                </div>

                {/* Info */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.95))',
                  padding: '50px 15px 15px'
                }}>
                  <div style={{
                    fontWeight: 'bold',
                    fontSize: '16px',
                    marginBottom: '5px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {story.title}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#aaa',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '8px'
                  }}>
                    <span>{story.category}</span>
                    <span style={{
                      background: 'rgba(16, 185, 129, 0.2)',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#10b981'
                    }}>
                      ⏱️ {story.duration || '5-15 min'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
        }
      `}</style>
    </div>
  )
}
