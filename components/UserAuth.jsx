import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

export default function UserAuth({ onClose }) {
  const { login, signup } = useAuth()
  const toast = useToast()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password)
        if (result.success) {
          toast.success('Login successful!')
          onClose()
        } else {
          toast.error(result.error || 'Invalid email or password')
        }
      } else {
        if (formData.password.length < 8) {
          toast.error('Password must be at least 8 characters')
          setLoading(false)
          return
        }
        const result = await signup(formData.name, formData.email, formData.password)
        if (result.success) {
          toast.success('Account created!')
          onClose()
        } else {
          toast.error(result.error || 'Signup failed')
        }
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isLogin ? 'Login' : 'Sign Up'}
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal-content" style={{
        background: '#1a1a1a',
        borderRadius: '15px',
        padding: 'clamp(20px, 4vw, 40px)',
        maxWidth: '450px',
        width: '100%',
        position: 'relative',
        maxHeight: '100vh',
        maxHeight: '100dvh',
        overflowY: 'auto'
      }}>
        <button
          onClick={onClose}
          aria-label="Close"
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
          &#x2715;
        </button>

        <h2 style={{
          margin: '0 0 10px 0',
          fontSize: '32px',
          background: 'linear-gradient(135deg, #e50914, #ff6b6b)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center'
        }}>
          STAGE fm
        </h2>

        <p style={{
          textAlign: 'center',
          color: '#aaa',
          marginBottom: '30px',
          fontSize: '14px'
        }}>
          {isLogin ? 'Login to your account' : 'Create a new account'}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="auth-name" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#ccc' }}>
                Name
              </label>
              <input
                id="auth-name"
                type="text"
                required
                autoComplete="name"
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
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#333'}
              />
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="auth-email" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#ccc' }}>
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              required
              autoComplete="email"
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
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#333'}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label htmlFor="auth-password" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#ccc' }}>
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              minLength={8}
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
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#333'}
            />
            {!isLogin && (
              <p style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
                Min 8 characters, include a number and special character
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#666' : 'linear-gradient(135deg, #e50914, #ff6b6b)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '15px',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#aaa' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              style={{
                color: '#667eea',
                cursor: 'pointer',
                fontWeight: 'bold',
                background: 'none',
                border: 'none',
                fontSize: '14px',
                padding: 0
              }}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
