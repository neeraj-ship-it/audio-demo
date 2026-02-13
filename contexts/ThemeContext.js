import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

const themes = {
  dark: {
    bg: '#0a0a0a',
    bgSecondary: '#1a1a1a',
    bgCard: '#111111',
    text: '#ffffff',
    textSecondary: '#aaaaaa',
    border: '#333333',
    accent: '#667eea',
    accentSecondary: '#764ba2'
  },
  light: {
    bg: '#ffffff',
    bgSecondary: '#f5f5f5',
    bgCard: '#fafafa',
    text: '#1a1a1a',
    textSecondary: '#666666',
    border: '#e0e0e0',
    accent: '#667eea',
    accentSecondary: '#f5576c'
  }
}

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('audioflix_theme')
    if (saved) setIsDarkMode(saved === 'dark')
  }, [])

  useEffect(() => {
    localStorage.setItem('audioflix_theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  const toggleTheme = () => setIsDarkMode(prev => !prev)
  const currentTheme = isDarkMode ? themes.dark : themes.light

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, currentTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
