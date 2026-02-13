import StoryCard from './StoryCard'

export default function StorySection({
  title,
  stories,
  currentPlaying,
  storyRatings,
  onPlay,
  onShare,
  onRate,
}) {
  if (!stories || stories.length === 0) return null

  return (
    <section style={{ marginBottom: '50px' }}>
      <h3 style={{ fontSize: '24px', marginBottom: '25px', fontWeight: '600', paddingLeft: '10px' }}>
        {title}
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '24px',
        justifyContent: 'center'
      }}>
        {stories.map(story => (
          <StoryCard
            key={story.id + title}
            story={story}
            isPlaying={currentPlaying?.id === story.id}
            storyRating={storyRatings?.[story.id]}
            onPlay={onPlay}
            onShare={onShare}
            onRate={onRate}
          />
        ))}
      </div>
    </section>
  )
}
