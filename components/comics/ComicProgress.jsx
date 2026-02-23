/**
 * ComicProgress - Panel dots + "Panel X of Y" indicator
 */
export default function ComicProgress({ currentPanel, totalPanels, onGoToPanel }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 0',
    }}>
      {/* Dots */}
      <div style={{
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        maxWidth: '80%',
      }}>
        {Array.from({ length: totalPanels }, (_, i) => (
          <button
            key={i}
            onClick={() => onGoToPanel && onGoToPanel(i)}
            aria-label={`Go to panel ${i + 1}`}
            style={{
              width: currentPanel === i ? '20px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: currentPanel === i
                ? '#667eea'
                : i < currentPanel
                  ? 'rgba(102,126,234,0.5)'
                  : 'rgba(255,255,255,0.3)',
              border: 'none',
              cursor: onGoToPanel ? 'pointer' : 'default',
              transition: 'all 0.3s ease',
              padding: 0,
              minWidth: 'auto',
              minHeight: 'auto',
            }}
          />
        ))}
      </div>

      {/* Text indicator */}
      <div style={{
        fontSize: '12px',
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
        letterSpacing: '0.5px',
      }}>
        {currentPanel + 1} / {totalPanels}
      </div>
    </div>
  )
}
