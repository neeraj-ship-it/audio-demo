import { useState, useEffect, useRef, useCallback } from 'react';

const RECENT_SEARCHES_KEY = 'stagefm_recent_searches';
const MAX_RECENT = 5;
const MAX_SUGGESTIONS = 5;
const DEBOUNCE_MS = 300;

function loadRecentSearches() {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(searches) {
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch {
    // localStorage unavailable
  }
}

export default function SearchBar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  resultCount,
  stories = [],
}) {
  const [clearHover, setClearHover] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Sync localQuery when searchQuery prop changes externally (e.g. clear button)
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    setRecentSearches(loadRecentSearches());
  }, []);

  // Debounced search: propagate localQuery -> onSearchChange after 300ms
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      onSearchChange(localQuery);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [localQuery, onSearchChange]);

  // Compute suggestions whenever localQuery or stories change
  useEffect(() => {
    if (!localQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const lower = localQuery.toLowerCase();
    const matches = stories
      .filter((story) => story.title && story.title.toLowerCase().includes(lower))
      .slice(0, MAX_SUGGESTIONS)
      .map((story) => story.title);
    setSuggestions(matches);
    setSelectedIndex(-1);
  }, [localQuery, stories]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addRecentSearch = useCallback((term) => {
    if (!term.trim()) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== term);
      const updated = [term, ...filtered].slice(0, MAX_RECENT);
      saveRecentSearches(updated);
      return updated;
    });
  }, []);

  const selectSuggestion = useCallback(
    (value) => {
      setLocalQuery(value);
      onSearchChange(value);
      addRecentSearch(value);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      inputRef.current?.focus();
    },
    [onSearchChange, addRecentSearch]
  );

  const handleInputChange = (e) => {
    setLocalQuery(e.target.value);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const handleFocus = () => {
    setShowSuggestions(true);
  };

  const handleKeyDown = (e) => {
    const items = localQuery.trim() ? suggestions : recentSearches;
    if (!showSuggestions || items.length === 0) {
      if (e.key === 'Enter') {
        addRecentSearch(localQuery);
        setShowSuggestions(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          selectSuggestion(items[selectedIndex]);
        } else {
          addRecentSearch(localQuery);
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleClear = () => {
    setLocalQuery('');
    onSearchChange('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Determine which list to show in the dropdown
  const isQueryEmpty = !localQuery.trim();
  const dropdownItems = isQueryEmpty ? recentSearches : suggestions;
  const dropdownHeader = isQueryEmpty ? 'Recent Searches' : 'Suggestions';
  const shouldShowDropdown = showSuggestions && dropdownItems.length > 0;

  return (
    <div
      className="search-bar-wrapper"
      style={{
        position: 'sticky',
        top: 72,
        zIndex: 99,
        background: 'rgba(0,0,0,0.95)',
        padding: 'clamp(12px, 2vw, 20px) clamp(15px, 3vw, 40px)',
        borderBottom: '1px solid #333',
      }}
    >
      <div
        className="search-bar-inner"
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          gap: 'clamp(10px, 1.5vw, 15px)',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* Search input with suggestions dropdown */}
        <div style={{ flex: 1, position: 'relative', minWidth: '200px' }} ref={containerRef}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search stories by title or category..."
            value={localQuery}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            autoComplete="off"
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
              minHeight: '48px',
            }}
          />
          {localQuery && (
            <button
              onClick={handleClear}
              onMouseEnter={() => setClearHover(true)}
              onMouseLeave={() => setClearHover(false)}
              style={{
                position: 'absolute',
                right: 12,
                top: 24,
                transform: 'translateY(-50%)',
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: clearHover
                  ? 'rgba(255,255,255,0.2)'
                  : 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                zIndex: 2,
              }}
            >
              X
            </button>
          )}

          {/* Suggestions / Recent Searches dropdown */}
          {shouldShowDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: 6,
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: 12,
                maxHeight: 300,
                overflowY: 'auto',
                zIndex: 100,
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '10px 20px 6px',
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#888',
                }}
              >
                {dropdownHeader}
              </div>

              {/* Items */}
              {dropdownItems.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={`${item}-${index}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectSuggestion(item);
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    style={{
                      padding: '12px 20px',
                      cursor: 'pointer',
                      color: '#e0e0e0',
                      fontSize: 14,
                      background: isSelected ? '#2a2a2a' : 'transparent',
                      borderLeft: isSelected ? '3px solid #667eea' : '3px solid transparent',
                      transition: 'background 0.15s, border-color 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <span style={{ color: '#666', fontSize: 13 }}>
                      {isQueryEmpty ? '\u23F2' : '\uD83D\uDD0D'}
                    </span>
                    <span>{item}</span>
                  </div>
                );
              })}
            </div>
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
            minHeight: '48px',
          }}
        >
          <option value="latest">Latest First</option>
          <option value="title">A-Z</option>
        </select>

        {/* Results count badge */}
        <span
          className="result-count"
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
