import { useState, useEffect } from 'react'

export default function ComingSoon() {
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/content/coming-soon')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSchedule(data.schedule)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load schedule:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div style={{padding:'40px',textAlign:'center'}}>
        <div style={{fontSize:'40px',marginBottom:'20px'}}>⏳</div>
        <div>Loading schedule...</div>
      </div>
    )
  }

  return (
    <div style={{padding:'40px',background:'#1a1a1a',borderRadius:'15px',margin:'40px'}}>
      <h2 style={{fontSize:'32px',marginBottom:'10px',display:'flex',alignItems:'center',gap:'15px'}}>
        <span>📅</span> Coming Soon
      </h2>
      <p style={{color:'#888',marginBottom:'30px'}}>
        Next 7 days schedule • Fresh content daily
      </p>

      <div style={{display:'flex',flexDirection:'column',gap:'25px'}}>
        {schedule.map((day, idx) => (
          <div key={idx} style={{
            background:'#0a0a0a',
            padding:'25px',
            borderRadius:'12px',
            border:'1px solid #333'
          }}>
            {/* Date Header */}
            <div style={{
              display:'flex',
              justifyContent:'space-between',
              alignItems:'center',
              marginBottom:'20px',
              paddingBottom:'15px',
              borderBottom:'1px solid #333'
            }}>
              <div>
                <div style={{fontSize:'20px',fontWeight:'bold',marginBottom:'5px'}}>
                  {day.dayName}
                </div>
                <div style={{fontSize:'14px',color:'#666'}}>
                  {new Date(day.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
              <div style={{
                background:'#667eea',
                padding:'8px 15px',
                borderRadius:'20px',
                fontSize:'12px',
                fontWeight:'bold'
              }}>
                {day.content.length} Stories
              </div>
            </div>

            {/* Content Cards */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',gap:'15px'}}>
              {day.content.map((item, cidx) => (
                <div key={cidx} style={{
                  background:'linear-gradient(135deg, #2a2a2a, #1a1a1a)',
                  padding:'20px',
                  borderRadius:'10px',
                  display:'flex',
                  alignItems:'center',
                  gap:'15px',
                  border:'1px solid #444',
                  position:'relative',
                  overflow:'hidden'
                }}>
                  {/* Emoji Icon */}
                  <div style={{
                    fontSize:'50px',
                    minWidth:'70px',
                    textAlign:'center',
                    background:'rgba(102, 126, 234, 0.1)',
                    borderRadius:'10px',
                    padding:'10px'
                  }}>
                    {item.emoji}
                  </div>

                  {/* Content Info */}
                  <div style={{flex:1}}>
                    <div style={{
                      fontSize:'16px',
                      fontWeight:'bold',
                      marginBottom:'8px',
                      color:'#fff'
                    }}>
                      {item.title}
                    </div>
                    <div style={{
                      display:'flex',
                      gap:'10px',
                      flexWrap:'wrap',
                      alignItems:'center'
                    }}>
                      <span style={{
                        background:'rgba(102, 126, 234, 0.2)',
                        padding:'4px 10px',
                        borderRadius:'12px',
                        fontSize:'11px',
                        color:'#667eea'
                      }}>
                        {item.genre}
                      </span>
                      {item.isSpecial && (
                        <span style={{
                          background:'#e50914',
                          padding:'4px 10px',
                          borderRadius:'12px',
                          fontSize:'11px',
                          fontWeight:'bold'
                        }}>
                          🎉 {item.occasionName}
                        </span>
                      )}
                      <span style={{
                        fontSize:'11px',
                        color:'#888'
                      }}>
                        Slot {item.slot}
                      </span>
                    </div>
                  </div>

                  {/* Coming Soon Badge */}
                  <div style={{
                    position:'absolute',
                    top:'-25px',
                    right:'-25px',
                    background:'linear-gradient(135deg, #667eea, #764ba2)',
                    width:'100px',
                    height:'100px',
                    borderRadius:'50%',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    fontSize:'10px',
                    fontWeight:'bold',
                    transform:'rotate(15deg)',
                    opacity:0.6
                  }}>
                    SOON
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
