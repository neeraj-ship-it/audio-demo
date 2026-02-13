import { useState, useEffect } from 'react'

export default function RatingModal({ story, currentUser, onClose }) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState('')
  const [existingRatings, setExistingRatings] = useState([])
  const [averageRating, setAverageRating] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load existing ratings
    fetch(`/api/ratings/${story.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setExistingRatings(data.ratings)
          setAverageRating(data.average)
        }
      })
  }, [story.id])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!currentUser) {
      alert('Please login to rate!')
      return
    }

    if (rating === 0) {
      alert('Please select a rating!')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/ratings/${story.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          rating,
          review
        })
      })

      const data = await res.json()

      if (data.success) {
        alert('Rating submitted successfully!')
        onClose()
      } else {
        alert('Failed to submit rating')
      }
    } catch (error) {
      alert('Error submitting rating')
    } finally {
      setLoading(false)
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
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        background: '#1a1a1a',
        borderRadius: '15px',
        padding: '30px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            float: 'right',
            background: 'none',
            border: 'none',
            color: '#aaa',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>

        {/* Story Info */}
        <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>
          {story.title}
        </h2>
        <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '20px' }}>
          {story.category}
        </p>

        {/* Average Rating */}
        {existingRatings.length > 0 && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', color: '#10b981', fontWeight: 'bold' }}>
              {averageRating.toFixed(1)} ⭐
            </div>
            <div style={{ fontSize: '14px', color: '#aaa' }}>
              {existingRatings.length} rating{existingRatings.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        {/* Rate This Story */}
        <form onSubmit={handleSubmit}>
          <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>
            Rate This Story
          </h3>

          {/* Star Rating */}
          <div style={{
            display: 'flex',
            gap: '10px',
            fontSize: '40px',
            marginBottom: '20px',
            justifyContent: 'center'
          }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                style={{
                  cursor: 'pointer',
                  color: star <= (hoverRating || rating) ? '#ffd700' : '#333',
                  transition: 'all 0.2s'
                }}
              >
                ⭐
              </span>
            ))}
          </div>

          {/* Review Text */}
          <textarea
            placeholder="Write your review (optional)..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              background: '#2a2a2a',
              border: '2px solid #333',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              marginBottom: '20px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || rating === 0}
            style={{
              width: '100%',
              padding: '14px',
              background: rating === 0 ? '#333' : 'linear-gradient(135deg, #10b981, #3b82f6)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: rating === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Submitting...' : 'Submit Rating'}
          </button>
        </form>

        {/* Existing Reviews */}
        {existingRatings.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>
              Reviews ({existingRatings.length})
            </h3>
            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
              {existingRatings.slice(0, 10).map((r, idx) => (
                <div key={idx} style={{
                  background: '#2a2a2a',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                      {r.userName}
                    </div>
                    <div style={{ color: '#ffd700', fontSize: '14px' }}>
                      {'⭐'.repeat(r.rating)}
                    </div>
                  </div>
                  {r.review && (
                    <div style={{ fontSize: '14px', color: '#ccc', lineHeight: '1.5' }}>
                      {r.review}
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
