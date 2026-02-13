import { useTheme } from '../contexts/ThemeContext'

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: 'fixed',
        top: '85px',
        right: '20px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        background: isDarkMode
          ? 'linear-gradient(135deg, #667eea, #764ba2)'
          : 'linear-gradient(135deg, #f093fb, #f5576c)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '22px',
        boxShadow: isDarkMode
          ? '0 8px 24px rgba(102, 126, 234, 0.4)'
          : '0 8px 24px rgba(245, 87, 108, 0.4)',
        zIndex: 999,
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1) rotate(15deg)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
      }}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDarkMode ? '\u2600\uFE0F' : '\uD83C\uDF19'}
    </button>
  )
}
