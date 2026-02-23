import { useTheme } from '../../contexts/ThemeContext'

export default function StoryProgress({
  completionPercentage,
  totalChoicesMade,
  scenesVisited,
  totalScenes,
  endingsDiscovered,
  totalEndings,
}) {
  const { isDarkMode } = useTheme()

  return (
    <div style={{ width: '100%' }}>
      {/* Thin progress bar at top */}
      <div style={{
        width: '100%',
        height: '3px',
        background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        position: 'relative',
      }}>
        <div style={{
          width: `${completionPercentage}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #667eea, #764ba2)',
          transition: 'width 0.5s ease',
          borderRadius: '0 2px 2px 0',
        }} />
      </div>

      {/* Stats row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        fontSize: '12px',
        color: isDarkMode ? '#888' : '#666',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>
            {scenesVisited?.length || 0}/{totalScenes} scenes
          </span>
          <span>
            {totalChoicesMade} choices
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {Array.from({ length: totalEndings }).map((_, i) => (
            <span
              key={i}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: i < (endingsDiscovered?.length || 0)
                  ? '#ffd700'
                  : isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                transition: 'background 0.3s ease',
              }}
              title={i < (endingsDiscovered?.length || 0) ? 'Ending discovered' : 'Ending not found'}
            />
          ))}
          <span style={{ marginLeft: '4px' }}>
            {endingsDiscovered?.length || 0}/{totalEndings}
          </span>
        </div>
      </div>
    </div>
  )
}
