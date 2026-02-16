import { useState, useEffect, useCallback } from 'react'

export default function useUser() {
  const [currentUser, setCurrentUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [userFavorites, setUserFavorites] = useState([])
  const [userHistory, setUserHistory] = useState([])

  // Load current user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('audioflix_current_user')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setCurrentUser(user)
      setUserFavorites(user.favorites || [])
      setUserHistory(user.history || [])
    }
  }, [])

  const handleLogin = useCallback((user) => {
    setCurrentUser(user)
    setUserFavorites(user.favorites || [])
    setUserHistory(user.history || [])
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('audioflix_current_user')
    setCurrentUser(null)
    setUserFavorites([])
    setUserHistory([])
  }, [])

  const toggleFavorite = useCallback((storyId) => {
    if (!currentUser) {
      setShowAuthModal(true)
      return
    }

    setUserFavorites(prev => {
      const newFavorites = prev.includes(storyId)
        ? prev.filter(id => id !== storyId)
        : [...prev, storyId]

      // Update user in localStorage
      const users = JSON.parse(localStorage.getItem('audioflix_users') || '[]')
      const userIndex = users.findIndex(u => u.id === currentUser.id)
      if (userIndex !== -1) {
        users[userIndex].favorites = newFavorites
        localStorage.setItem('audioflix_users', JSON.stringify(users))
        localStorage.setItem('audioflix_current_user', JSON.stringify(users[userIndex]))
      }

      return newFavorites
    })
  }, [currentUser])

  return {
    currentUser,
    showAuthModal, setShowAuthModal,
    userFavorites,
    userHistory, setUserHistory,
    handleLogin,
    handleLogout,
    toggleFavorite,
  }
}
