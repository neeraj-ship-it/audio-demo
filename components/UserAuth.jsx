import { useState } from 'react'

export default function UserAuth({ onClose, onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    if (isLogin) {
      // Login logic
      const users = JSON.parse(localStorage.getItem('audioflix_users') || '[]')
      const user = users.find(u => u.email === formData.email && u.password === formData.password)

      if (user) {
        localStorage.setItem('audioflix_current_user', JSON.stringify(user))
        onLogin(user)
        onClose()
      } else {
        alert('Invalid email or password!')
      }
    } else {
      // Signup logic
      const users = JSON.parse(localStorage.getItem('audioflix_users') || '[]')

      if (users.find(u => u.email === formData.email)) {
        alert('Email already registered!')
        return
      }

      const newUser = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        favorites: [],
        history: [],
        createdAt: new Date().toISOString()
      }

      users.push(newUser)
      localStorage.setItem('audioflix_users', JSON.stringify(users))
      localStorage.setItem('audioflix_current_user', JSON.stringify(newUser))

      onLogin(newUser)
      onClose()
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        background: '#1a1a1a',
        borderRadius: '15px',
        padding: '40px',
        maxWidth: '450px',
        width: '90%',
        position: 'relative'
      }}>
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

        {/* Logo */}
        <h2 style={{
          margin: '0 0 10px 0',
          fontSize: '32px',
          background: 'linear-gradient(135deg, #e50914, #ff6b6b)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center'
        }}>
          🎵 STAGE fm
        </h2>

        <p style={{
          textAlign: 'center',
          color: '#aaa',
          marginBottom: '30px',
          fontSize: '14px'
        }}>
          {isLogin ? 'Login to your account' : 'Create a new account'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#ccc' }}>
                Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#2a2a2a',
                  border: '2px solid #333',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '15px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#333'}
              />
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#ccc' }}>
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                background: '#2a2a2a',
                border: '2px solid #333',
                borderRadius: '8px',
                color: 'white',
                fontSize: '15px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#333'}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#ccc' }}>
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                background: '#2a2a2a',
                border: '2px solid #333',
                borderRadius: '8px',
                color: 'white',
                fontSize: '15px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#333'}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #e50914, #ff6b6b)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '15px'
            }}
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#aaa' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span
              onClick={() => setIsLogin(!isLogin)}
              style={{
                color: '#667eea',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </span>
          </p>
        </form>
      </div>
    </div>
  )
}
