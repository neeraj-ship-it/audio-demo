import { useRouter } from 'next/router'

/**
 * ComicEndScreen - Completion screen shown after last panel
 */
export default function ComicEndScreen({ comic, panelsRead, readingTime, onReplay }) {
  const router = useRouter()

  const formatReadingTime = (seconds) => {
    if (!seconds) return '0s'
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(20px, 5vw, 40px)',
      textAlign: 'center',
      animation: 'endingFadeIn 0.5s ease-out',
      background: 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(245,158,11,0.1))',
    }}>
      {/* Completion emoji */}
      <div style={{
        fontSize: 'clamp(50px, 10vw, 80px)',
        marginBottom: '16px',
      }}>
        {comic.emoji || '📚'}
      </div>

      {/* Title */}
      <h2 style={{
        fontSize: 'clamp(20px, 4vw, 28px)',
        fontWeight: '800',
        marginBottom: '8px',
        lineHeight: '1.3',
      }}>
        {comic.title}
      </h2>

      <div style={{
        fontSize: 'clamp(14px, 2.5vw, 16px)',
        color: '#ec4899',
        fontWeight: '600',
        marginBottom: '24px',
      }}>
        Story Complete!
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'clamp(12px, 3vw, 20px)',
        marginBottom: '32px',
        width: '100%',
        maxWidth: '350px',
      }}>
        {[
          { label: 'Panels', value: panelsRead || comic.totalPanels, icon: '🖼' },
          { label: 'Time', value: formatReadingTime(readingTime || 0), icon: '⏱' },
          { label: 'Category', value: comic.category, icon: comic.emoji || '📖' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '12px 8px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{stat.icon}</div>
            <div style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: '700' }}>{stat.value}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '350px',
      }}>
        <button
          onClick={onReplay}
          aria-label="Read again"
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, #ec4899, #f59e0b)',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '25px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          Read Again
        </button>
        <button
          onClick={() => router.push('/comics')}
          aria-label="Browse more comics"
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            border: '1.5px solid rgba(255,255,255,0.2)',
            padding: '12px 20px',
            borderRadius: '25px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          More Comics
        </button>
      </div>
    </div>
  )
}
