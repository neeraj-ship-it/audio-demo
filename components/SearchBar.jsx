import { useState } from 'react';

export default function SearchBar({ searchQuery, onSearchChange, sortBy, onSortChange, resultCount }) {
  const [clearHover, setClearHover] = useState(false);

  return (
    <div
      style={{
        position: 'sticky',
        top: 72,
        zIndex: 99,
        background: 'rgba(0,0,0,0.95)',
        padding: '20px 40px',
        borderBottom: '1px solid #333',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          gap: 15,
          alignItems: 'center',
        }}
      >
        {/* Search input */}
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder="Search stories by title or category..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 50px 14px 20px',
              background: '#2a2a2a',
              border: '2px solid #667eea',
              borderRadius: 25,
              color: 'white',
              fontSize: 15,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              onMouseEnter={() => setClearHover(true)}
              onMouseLeave={() => setClearHover(false)}
              style={{
                position: 'absolute',
                right: 18,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: clearHover ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              X
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          style={{
            padding: '12px 15px',
            background: '#2a2a2a',
            border: '2px solid #667eea',
            borderRadius: 25,
            color: 'white',
            fontSize: 14,
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="latest">⏰ Latest First</option>
          <option value="title">🔤 A-Z</option>
        </select>

        {/* Results count badge */}
        <span
          style={{
            background: 'rgba(16,185,129,0.2)',
            borderRadius: 20,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 'bold',
            color: '#10b981',
            whiteSpace: 'nowrap',
          }}
        >
          {resultCount} stories
        </span>
      </div>
    </div>
  );
}
