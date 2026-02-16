import { useEffect } from 'react';

export default function HeroCarousel({ stories, heroIndex, setHeroIndex, storyRatings, onPlay, onMoreInfo }) {
  const maxSlides = Math.min(stories.length, 5);

  useEffect(() => {
    if (maxSlides === 0) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % maxSlides);
    }, 2000);
    return () => clearInterval(interval);
  }, [maxSlides, setHeroIndex]);

  if (stories.length === 0) return null;

  const currentStory = stories[heroIndex];
  const rating = storyRatings?.[currentStory?.id];

  const backgroundImage = currentStory?.thumbnailUrl
    ? `url(${currentStory.thumbnailUrl})`
    : `linear-gradient(135deg, #${((currentStory?.id * 123456) % 0xFFFFFF).toString(16).padStart(6, '0')}, #${((currentStory?.id * 654321) % 0xFFFFFF).toString(16).padStart(6, '0')})`;

  return (
    <div
      className="hero-carousel"
      role="region"
      aria-label="Featured stories carousel"
      aria-roledescription="carousel"
      style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(250px, 50vh, 600px)',
        backgroundImage: backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 0.8s ease-in-out',
        overflow: 'hidden',
      }}
    >
      {/* Left gradient overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.4) 60%, transparent 100%)',
        }}
      />

      {/* Text content */}
      <div
        className="hero-content"
        aria-live="off"
        aria-atomic="true"
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '55%',
          padding: 'clamp(15px, 4vw, 60px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Badges row */}
        <div className="hero-badges" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'clamp(8px, 2vw, 16px)', flexWrap: 'wrap' }}>
          <span
            style={{
              backgroundColor: '#e50914',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: 'clamp(10px, 1.5vw, 12px)',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            NEW
          </span>
          {rating !== undefined && rating !== null && (
            <span
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#ffd700',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: 'clamp(11px, 1.5vw, 13px)',
                fontWeight: '600',
              }}
            >
              {typeof rating === 'number' ? rating.toFixed(1) : rating}
            </span>
          )}
          {currentStory?.category && (
            <span
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: 'clamp(11px, 1.5vw, 13px)',
                fontWeight: '500',
              }}
            >
              {currentStory.category}
            </span>
          )}
          {currentStory?.duration && (
            <span
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: 'clamp(11px, 1.5vw, 13px)',
                fontWeight: '500',
              }}
            >
              {currentStory.duration}
            </span>
          )}
        </div>

        {/* Title */}
        <h1
          className="hero-title"
          style={{
            fontSize: 'clamp(22px, 5vw, 56px)',
            fontWeight: 'bold',
            color: '#fff',
            margin: '0 0 clamp(8px, 1.5vw, 16px) 0',
            lineHeight: 1.1,
          }}
        >
          {currentStory?.emoji && <span>{currentStory.emoji} </span>}
          {currentStory?.title}
        </h1>

        {/* Description */}
        <p
          className="hero-description"
          style={{
            fontSize: 'clamp(14px, 2vw, 18px)',
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.5,
            margin: '0 0 clamp(14px, 3vw, 28px) 0',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {currentStory?.description}
        </p>

        {/* Buttons */}
        <div className="hero-buttons" style={{ display: 'flex', gap: 'clamp(8px, 1.5vw, 14px)' }}>
          <button
            onClick={() => onPlay && onPlay(currentStory)}
            aria-label={`Play ${currentStory?.title}`}
            style={{
              backgroundColor: '#fff',
              color: '#000',
              border: 'none',
              padding: 'clamp(10px, 1.5vw, 14px) clamp(18px, 3vw, 32px)',
              fontSize: 'clamp(13px, 1.5vw, 16px)',
              fontWeight: 'bold',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'opacity 0.2s',
              minHeight: '44px',
              minWidth: '44px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Play Now
          </button>
          <button
            onClick={() => onMoreInfo && onMoreInfo(currentStory)}
            aria-label={`More info about ${currentStory?.title}`}
            style={{
              backgroundColor: 'rgba(109,109,110,0.7)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.5)',
              padding: 'clamp(10px, 1.5vw, 14px) clamp(18px, 3vw, 32px)',
              fontSize: 'clamp(13px, 1.5vw, 16px)',
              fontWeight: 'bold',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'opacity 0.2s',
              minHeight: '44px',
              minWidth: '44px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            More Info
          </button>
        </div>
      </div>

      {/* Slide indicators */}
      <div
        className="hero-indicators"
        role="tablist"
        aria-label="Carousel slide indicators"
        style={{
          position: 'absolute',
          bottom: 'clamp(12px, 2vw, 24px)',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          zIndex: 2,
        }}
      >
        {Array.from({ length: maxSlides }).map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === heroIndex}
            onClick={() => setHeroIndex(i)}
            style={{
              width: i === heroIndex ? '32px' : '10px',
              height: '10px',
              borderRadius: '5px',
              backgroundColor: i === heroIndex ? '#fff' : 'rgba(255,255,255,0.5)',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
