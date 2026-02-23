import { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

export default function ChoiceButtons({ choices, onChoice, disabled }) {
  const { isDarkMode } = useTheme()
  const [selectedId, setSelectedId] = useState(null)

  if (!choices || choices.length === 0) return null

  const handleChoice = (choice) => {
    if (disabled) return
    setSelectedId(choice.id)
    // Small delay so user sees their selection
    setTimeout(() => {
      onChoice(choice)
      setSelectedId(null)
    }, 300)
  }

  return (
    <div
      className="choice-buttons"
      role="group"
      aria-label="Story choices"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{
        fontSize: '13px',
        fontWeight: '700',
        color: isDarkMode ? '#667eea' : '#5a67d8',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        marginBottom: '4px',
      }}>
        Choose your path
      </div>

      {choices.map((choice, index) => {
        const isSelected = selectedId === choice.id
        const animDelay = index * 100 // stagger entrance

        return (
          <button
            key={choice.id}
            onClick={() => handleChoice(choice)}
            disabled={disabled}
            aria-label={`Choice: ${choice.text}`}
            className="interactive-choice-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 18px',
              background: isSelected
                ? 'linear-gradient(135deg, #667eea, #764ba2)'
                : isDarkMode
                  ? 'rgba(102,126,234,0.08)'
                  : 'rgba(102,126,234,0.04)',
              border: isSelected
                ? '2px solid transparent'
                : `2px solid ${isDarkMode ? 'rgba(102,126,234,0.25)' : 'rgba(102,126,234,0.15)'}`,
              borderRadius: '14px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: disabled && !isSelected ? 0.5 : 1,
              color: isSelected ? 'white' : isDarkMode ? '#e0e0e0' : '#333',
              textAlign: 'left',
              minHeight: '44px',
              width: '100%',
              fontSize: '15px',
              fontWeight: '600',
              lineHeight: '1.4',
              animation: `choiceSlideIn 0.4s ease ${animDelay}ms both`,
              transform: isSelected ? 'scale(0.97)' : 'scale(1)',
            }}
          >
            {choice.emoji && (
              <span style={{
                fontSize: '22px',
                flexShrink: 0,
                width: '32px',
                textAlign: 'center',
              }}>
                {choice.emoji}
              </span>
            )}
            <div style={{ flex: 1 }}>
              <div>{choice.text}</div>
              {choice.consequence && !isSelected && (
                <div style={{
                  fontSize: '12px',
                  color: isDarkMode ? '#888' : '#999',
                  fontWeight: '400',
                  marginTop: '2px',
                }}>
                  {choice.consequence}
                </div>
              )}
            </div>
            <span style={{
              fontSize: '16px',
              color: isSelected ? 'white' : isDarkMode ? '#555' : '#ccc',
              flexShrink: 0,
            }}>
              {'\u203A'}
            </span>
          </button>
        )
      })}
    </div>
  )
}
