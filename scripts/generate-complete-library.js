const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const STORIES_DB = path.join(__dirname, '../data/stories.json')
const AUDIO_DIR = path.join(__dirname, '../public/audio')

// Complete story templates for 25 diverse stories
const completeStories = [
  // ROMANCE STORIES (6 total)
  {
    id: 20,
    title: 'College Ke Din',
    category: 'Romance',
    emoji: '💕',
    plays: '2.4M',
    duration: '8:45',
    prompt: `Create a complete 8-10 minute romantic story in Hindi about Aaryan and Sanya who meet at college fresher party. Include:
- Introduction: Fresher party, Sanya sings, Aaryan falls for her
- Friendship develops: Library meetings, sharing dreams (she wants to be playback singer, he discovers photography)
- Conflict: Sanya's transfer to Delhi due to father's job
- Climax: Aaryan confesses love before she leaves
- Long distance relationship for 2 years
- Resolution: Aaryan moves to Delhi for job, supports her first recording, proposes at Marine Drive
Must have 50-60 dialogues with Narrator, Aaryan, Sanya, Rohit (friend), Mother. Use emotions: CALM, NERVOUS, CHEERFUL, SHY, EXCITED, HOPEFUL, EMOTIONAL:sad, EMOTIONAL:romantic, DETERMINED, PEACEFUL, INSPIRING`
  },
  {
    id: 21,
    title: 'Dil Ki Dhadkan',
    category: 'Romance',
    emoji: '💕',
    plays: '1.9M',
    duration: '9:20',
    prompt: `Create a complete 9-10 minute Hindi romantic story about Karan (doctor) and Meera (artist) who keep meeting by chance at a cafe. Include:
- First meeting: Coffee spilled accident
- Repeated coincidental meetings
- Friendship develops over coffee and art discussions
- Meera's art exhibition, Karan attends
- Confession during rainy evening
- Happy ending with mutual love confession
50-60 dialogues with Narrator, Karan, Meera, Cafe Owner. Use emotions: SURPRISED, CHEERFUL, CALM, NERVOUS, EXCITED, EMOTIONAL:happy, ROMANTIC, PEACEFUL`
  },
  {
    id: 22,
    title: 'Childhood Wala Pyaar',
    category: 'Romance',
    emoji: '💕',
    plays: '3.1M',
    duration: '10:15',
    prompt: `Create a complete 10-12 minute Hindi romantic story about childhood friends Rahul and Anjali who reunite after 10 years. Include:
- Flashback: Childhood friendship, promise to marry
- Present: Both return to hometown for friend's wedding
- Awkward reunion, both have changed
- Rediscovering old memories, visiting old spots
- Realization that feelings never left
- Confession and happy ending
60-70 dialogues with Narrator, Rahul, Anjali, Friend. Use emotions: NOSTALGIC, CHEERFUL, NERVOUS, SHY, EMOTIONAL:happy, ROMANTIC, PEACEFUL, HOPEFUL`
  },
  {
    id: 23,
    title: 'Office Romance',
    category: 'Romance',
    emoji: '💕',
    plays: '1.7M',
    duration: '7:30',
    prompt: `Create a complete 7-8 minute Hindi romantic story about Vivek and Riya who are rivals at office competing for promotion. Include:
- Introduction: Both are top performers, competitive
- Project: Forced to work together on important client
- Initial clashes, then understanding each other
- Late night work sessions, bonding
- Realization of attraction during presentation success
- Confession after promotion announcement
40-50 dialogues with Narrator, Vivek, Riya, Boss. Use emotions: CONFIDENT, COMPETITIVE, FRUSTRATED, CALM, CHEERFUL, NERVOUS, ROMANTIC, HAPPY`
  },
  {
    id: 24,
    title: 'Shaadi Se Pehle',
    category: 'Romance',
    emoji: '💕',
    plays: '2.8M',
    duration: '11:40',
    prompt: `Create a complete 11-12 minute Hindi romantic story about Aditya and Priya's arranged marriage preparation. Include:
- First meeting: Families introduce them
- Awkward conversations, getting to know phase
- Pre-wedding functions: sangeet, mehendi
- Cold feet moment, both have doubts
- Heart-to-heart conversation night before wedding
- Realization they're perfect for each other
- Wedding day happiness
70-80 dialogues with Narrator, Aditya, Priya, Mother, Father, Sister. Use emotions: NERVOUS, SHY, CHEERFUL, AWKWARD, FEARFUL, EMOTIONAL:concerned, HAPPY, ROMANTIC, PEACEFUL, JOYFUL`
  },
  {
    id: 25,
    title: 'Train Wali Love Story',
    category: 'Romance',
    emoji: '💕',
    plays: '2.2M',
    duration: '8:20',
    prompt: `Create a complete 8-9 minute Hindi romantic story about Sameer and Naina who meet during daily Mumbai local train commute. Include:
- First meeting: Crowded train, accidental eye contact
- Daily encounters, small smiles
- One day Sameer helps Naina when she almost falls
- Start talking, exchange numbers
- Coffee dates after work
- Love confession during sunset at Marine Drive
45-55 dialogues with Narrator, Sameer, Naina, Friend. Use emotions: CALM, SURPRISED, CHEERFUL, SHY, NERVOUS, EXCITED, ROMANTIC, HAPPY, PEACEFUL`
  },

  // HORROR STORIES (5 total)
  {
    id: 26,
    title: 'Purani Haveli Ka Rahasya',
    category: 'Horror',
    emoji: '👻',
    plays: '4.1M',
    duration: '12:15',
    prompt: `Create a complete 12-14 minute Hindi horror story about Vikram who challenges ghost stories and spends night in haunted mansion. Include:
- Setup: Village ghost stories about Rajkumari Ananya
- Vikram's challenge to prove ghosts don't exist
- Entering mansion: creepy atmosphere, old furniture
- Finding diary: Ananya's tragic love story (1974)
- Supernatural encounter: Ananya's ghost appears
- Her story: Suicide due to forced marriage, lover also died
- Resolution: Vikram helps spread their love story, ghost finds peace
70-80 dialogues with Narrator, Vikram, Amit, Ananya, Voice. Use emotions: WHISPER, DARK, CONFIDENT, FEARFUL, TENSE, NERVOUS, SCREAM, EMOTIONAL:sad, CALM, PEACEFUL, INSPIRING`
  },
  {
    id: 27,
    title: '3 AM Call',
    category: 'Horror',
    emoji: '👻',
    plays: '3.8M',
    duration: '9:45',
    prompt: `Create a complete 9-10 minute Hindi horror story about Rohan who receives mysterious calls at 3 AM every night. Include:
- First call: Unknown number, silence
- Second night: Heavy breathing
- Third night: "Main aa raha hoon"
- Investigation: Number belongs to person who died 5 years ago
- Revelation: Rohan was involved in accident that killed the person
- Haunting intensifies with paranormal activities
- Climax: Face-to-face encounter, seeking justice
- Resolution: Rohan confesses, finds redemption
55-65 dialogues with Narrator, Rohan, Voice, Friend, Police. Use emotions: FEARFUL, WHISPER, TENSE, NERVOUS, DARK, SCREAM, URGENT, EMOTIONAL:guilty, CALM`
  },
  {
    id: 28,
    title: 'Lift Ka Bhoot',
    category: 'Horror',
    emoji: '👻',
    plays: '3.5M',
    duration: '10:30',
    prompt: `Create a complete 10-11 minute Hindi horror story about office building's haunted lift that stops at non-existent 13th floor. Include:
- Setup: New employee Shreya hears stories
- First experience: Lift stops at 13, doors open to empty corridor
- Investigation: Building has only 12 floors
- Discovery: 13th floor was sealed after suicide 10 years ago
- Supernatural encounters increase
- Finding truth: Person was murdered, not suicide
- Resolution: Helping ghost expose truth
60-70 dialogues with Narrator, Shreya, Colleague, Security, Ghost. Use emotions: CALM, CURIOUS, FEARFUL, WHISPER, TENSE, DARK, SCREAM, EMOTIONAL:sad, DETERMINED, PEACEFUL`
  },
  {
    id: 29,
    title: 'Jungle Mein Raat',
    category: 'Horror',
    emoji: '👻',
    plays: '4.3M',
    duration: '11:20',
    prompt: `Create a complete 11-12 minute Hindi horror story about friends' camping trip in haunted forest. Include:
- Setup: Four friends (Arjun, Priya, Karan, Neha) plan adventure
- Local warning: Don't camp near old temple ruins
- Ignoring warnings, setting up camp
- Night falls: Strange sounds, movement in shadows
- Disappearances: Neha goes missing, then Karan
- Discovery: Ancient spirit protects temple
- Resolution: Apologizing, performing ritual, friends return safely
65-75 dialogues with Narrator, Arjun, Priya, Karan, Neha, Spirit, Local. Use emotions: EXCITED, CHEERFUL, FEARFUL, WHISPER, TENSE, SCREAM, URGENT, DARK, CALM, PEACEFUL`
  },
  {
    id: 30,
    title: 'Last Message',
    category: 'Horror',
    emoji: '👻',
    plays: '3.9M',
    duration: '8:50',
    prompt: `Create a complete 8-9 minute Hindi horror story about Riya receiving WhatsApp messages from her dead best friend. Include:
- Setup: Best friend Sneha died in accident 6 months ago
- First message: "Miss you" from Sneha's number
- More messages: Specific details only Sneha knew
- Fear and confusion, can't delete messages
- Messages become warnings: "Don't trust him"
- Revelation: Boyfriend planning to harm Riya
- Resolution: Messages save Riya's life, ghost protects friend
50-60 dialogues with Narrator, Riya, Messages, Boyfriend, Friend. Use emotions: EMOTIONAL:sad, SURPRISED, FEARFUL, CONFUSED, WHISPER, TENSE, URGENT, GRATEFUL, PEACEFUL`
  },

  // THRILLER STORIES (5 total)
  {
    id: 31,
    title: 'The Perfect Crime',
    category: 'Thriller',
    emoji: '🔪',
    plays: '5.2M',
    duration: '14:30',
    prompt: `Create a complete 14-15 minute Hindi thriller story about Inspector Arjun Singh solving businessman Rajesh Malhotra's murder. Include:
- Crime scene: Body found from 15th floor, no CCTV
- Investigation: Wife Priya's alibi, business rival Vikram
- Discovery: Blackmail, offshore accounts
- Flashback: 10-year-old hit-and-run case
- Twist: Multiple people wanted him dead
- Secretary planned but found body already dead
- Revelation: Priya poisoned him (revenge for brother's son)
- Court: Both secretary and Priya convicted
90-100 dialogues with Narrator, Inspector, Priya, Vikram, Secretary, Forensic, Constable. Use emotions: TENSE, DARK, URGENT, CALM, SUSPICIOUS, NERVOUS, FEARFUL, ANGRY, DETERMINED, SHOCKED`
  },
  {
    id: 32,
    title: 'Kidnapping',
    category: 'Thriller',
    emoji: '🔪',
    plays: '4.7M',
    duration: '12:40',
    prompt: `Create a complete 12-13 minute Hindi thriller story about CEO's daughter Anika kidnapping. Include:
- Setup: Anika kidnapped from college
- Ransom demand: 10 crores in 24 hours
- Police investigation: Inspector Sharma's strategy
- Family's desperation, father ready to pay
- Detective work: Tracing call, CCTV analysis
- Discovery: Inside job, driver involved
- Rescue operation: Finding warehouse location
- Action sequence: Police raid, Anika rescued
- Twist: Driver's motive (medical bills for sick child)
75-85 dialogues with Narrator, Inspector, Father, Mother, Kidnapper, Driver, Anika. Use emotions: FEARFUL, URGENT, TENSE, DETERMINED, DESPERATE, CALM, ANGRY, RELIEVED, EMOTIONAL:sad`
  },
  {
    id: 33,
    title: 'Serial Killer',
    category: 'Thriller',
    emoji: '🔪',
    plays: '5.8M',
    duration: '15:20',
    prompt: `Create a complete 15-16 minute Hindi thriller story about pattern-based serial killer in Mumbai. Include:
- Setup: Three murders in three weeks, all similar pattern
- Detective Priya joins investigation
- Pattern discovery: All victims were jury members from 10-year-old case
- Race against time: Identifying next target
- Cat and mouse: Killer leaves clues
- Revelation: Killer's brother was wrongly convicted in that case
- Confrontation: Detective faces killer
- Resolution: Killer caught, but sympathy for motive
95-105 dialogues with Narrator, Detective Priya, Killer, Partner, Forensic, Witness. Use emotions: DARK, TENSE, URGENT, DETERMINED, FEARFUL, SUSPICIOUS, ANGRY, EMOTIONAL:vengeful, CALM`
  },
  {
    id: 34,
    title: 'Double Life',
    category: 'Thriller',
    emoji: '🔪',
    plays: '4.2M',
    duration: '11:55',
    prompt: `Create a complete 11-12 minute Hindi thriller story about Neha discovering husband Rohit's secret double life. Include:
- Setup: Rohit acting strange, coming home late
- Neha's suspicion: Following him
- Discovery: Another apartment, different identity
- Investigation: Rohit living as "Karan" in another city
- Shock: He has another wife and child
- Confrontation: Both wives meet
- Police involved: Bigamy case
- Twist: Rohit involved in witness protection program, protecting both families
70-80 dialogues with Narrator, Neha, Rohit, Other Wife, Police, Friend. Use emotions: SUSPICIOUS, SHOCKED, ANGRY, BETRAYED, CONFUSED, TENSE, FEARFUL, CALM, UNDERSTANDING`
  },
  {
    id: 35,
    title: 'Data Breach',
    category: 'Thriller',
    emoji: '🔪',
    plays: '3.9M',
    duration: '10:25',
    prompt: `Create a complete 10-11 minute Hindi thriller story about cyber security expert Aryan investigating massive company data breach. Include:
- Setup: 10 lakh customers' data stolen
- Investigation: Tracing hack source
- Discovery: Inside job, someone with access
- Suspect list: Five employees
- Digital forensics: Finding digital footprints
- Revelation: Junior employee blackmailed by external gang
- Race against time: Stopping data auction on dark web
- Resolution: Data recovered, criminals caught
60-70 dialogues with Narrator, Aryan, Boss, Suspects, Police, Hacker. Use emotions: URGENT, TENSE, FOCUSED, DETERMINED, NERVOUS, RELIEVED, CALM`
  },

  // COMEDY STORIES (3 total)
  {
    id: 36,
    title: 'Shaadi Ke Side Effects',
    category: 'Comedy',
    emoji: '😂',
    plays: '6.2M',
    duration: '9:30',
    prompt: `Create a complete 9-10 minute Hindi comedy story about newlywed Raj adjusting to married life. Include:
- Setup: Raj's bachelor life vs married life
- Funny incidents: Wife's cooking experiments
- In-laws visiting unexpectedly
- Raj's attempts to maintain independence
- Wife's shopping addiction
- Couple's first big fight over small issue
- Makeup and learning to compromise
- Happy ending with humor
55-65 dialogues with Narrator, Raj, Wife Priya, Mother-in-law, Friend. Use emotions: CHEERFUL, FRUSTRATED, SARCASTIC, LAUGHING, ANNOYED, LOVING, HAPPY`
  },
  {
    id: 37,
    title: 'Job Interview Gone Wrong',
    category: 'Comedy',
    emoji: '😂',
    plays: '5.4M',
    duration: '8:15',
    prompt: `Create a complete 8-9 minute Hindi comedy story about Pappu's disastrous job interview. Include:
- Setup: Pappu needs job desperately
- Wrong office building, reaches late
- Series of mishaps: Coffee spill on interviewer
- Wrong answers to questions (funny)
- Accidentally insulting boss's degree
- Fire alarm during interview
- Chaos in office
- Twist: Gets job for "crisis handling" skills
45-55 dialogues with Narrator, Pappu, Interviewer, Receptionist, Boss. Use emotions: NERVOUS, PANICKED, EMBARRASSED, CHEERFUL, LAUGHING, SURPRISED, EXCITED, HAPPY`
  },
  {
    id: 38,
    title: 'Gym Jaana Hai',
    category: 'Comedy',
    emoji: '😂',
    plays: '4.8M',
    duration: '7:45',
    prompt: `Create a complete 7-8 minute Hindi comedy story about overweight Chintu's gym journey. Include:
- Setup: New Year resolution to get fit
- First day: Can't find gym clothes
- Struggles: Can't use machines properly
- Funny trainer interactions
- Wrong diet advice from friends
- Motivation drops, wants to quit
- Finds dance class instead, perfect fit
- Happy ending doing what he enjoys
40-50 dialogues with Narrator, Chintu, Trainer, Friend, Wife. Use emotions: DETERMINED, STRUGGLING, FRUSTRATED, TIRED, LAUGHING, CHEERFUL, HAPPY, PEACEFUL`
  },

  // SPIRITUAL STORIES (3 total)
  {
    id: 39,
    title: 'Guruji Ki Seekh',
    category: 'Spiritual',
    emoji: '🙏',
    plays: '7.1M',
    duration: '11:30',
    prompt: `Create a complete 11-12 minute Hindi spiritual story about stressed businessman Amit finding peace through guru's teachings. Include:
- Setup: Amit's stressful life, health issues
- Meeting Guruji at ashram
- First lesson: Present moment awareness
- Second lesson: Letting go of attachments
- Third lesson: Serving others brings joy
- Transformation journey over months
- Return to work with new perspective
- Life changes, inner peace achieved
65-75 dialogues with Narrator, Amit, Guruji, Wife, Colleague. Use emotions: STRESSED, CALM, PEACEFUL, CURIOUS, INSPIRED, GRATEFUL, WISE, JOYFUL, CONTENT`
  },
  {
    id: 40,
    title: 'Mandir Ki Ghanti',
    category: 'Spiritual',
    emoji: '🙏',
    plays: '6.8M',
    duration: '10:20',
    prompt: `Create a complete 10-11 minute Hindi spiritual story about atheist doctor Priya's faith journey. Include:
- Setup: Priya doesn't believe in God
- Critical patient case, medical science failing
- Desperation, accompanies mother to temple
- Unexplained recovery of patient
- Priya's inner conflict between logic and faith
- Series of coincidences (or miracles?)
- Understanding faith is personal journey
- Resolution: Respect for both science and faith
60-70 dialogues with Narrator, Priya, Mother, Patient, Priest, Colleague. Use emotions: SKEPTICAL, DESPERATE, SURPRISED, CONFUSED, THOUGHTFUL, PEACEFUL, GRATEFUL, WISE`
  },
  {
    id: 41,
    title: 'Karm Ka Fal',
    category: 'Spiritual',
    emoji: '🙏',
    plays: '5.9M',
    duration: '9:40',
    prompt: `Create a complete 9-10 minute Hindi spiritual story about kind-hearted Ramesh and selfish Mohan. Include:
- Setup: Two neighbors, opposite personalities
- Ramesh always helps others, struggles financially
- Mohan wealthy but never helps anyone
- Series of events showing karma in action
- Mohan faces crisis, only Ramesh helps
- Mohan's transformation after experiencing kindness
- Both become friends, help community together
- Teaching: What you give comes back
55-65 dialogues with Narrator, Ramesh, Mohan, Neighbor, Wife. Use emotions: KIND, SELFISH, STRUGGLING, DESPERATE, GRATEFUL, TRANSFORMED, CHEERFUL, INSPIRING, PEACEFUL`
  },

  // MOTIVATION STORIES (3 total)
  {
    id: 42,
    title: 'Struggler Se Star',
    category: 'Motivation',
    emoji: '💪',
    plays: '8.9M',
    duration: '13:25',
    prompt: `Create a complete 13-14 minute Hindi motivational story about struggling actor Aryan's journey to success. Include:
- Setup: Aryan comes to Mumbai with dreams
- Initial struggles: Rejections, auditions
- Financial crisis, living in small room
- Temptation to give up, return home
- One break: Small role in web series
- Hard work, dedication, improving craft
- More opportunities, recognition
- Finally lead role, success achieved
- Message: Never give up on dreams
75-85 dialogues with Narrator, Aryan, Director, Friend, Mother, Producer. Use emotions: HOPEFUL, REJECTED, STRUGGLING, DETERMINED, EXCITED, NERVOUS, CONFIDENT, TRIUMPHANT, GRATEFUL, INSPIRING`
  },
  {
    id: 43,
    title: 'Failure Se Success',
    category: 'Motivation',
    emoji: '💪',
    plays: '7.6M',
    duration: '10:50',
    prompt: `Create a complete 10-11 minute Hindi motivational story about IIT aspirant Riya's journey after failing exam. Include:
- Setup: Riya fails IIT entrance
- Depression, disappointment from family
- Decision: Try again vs give up
- Support from teacher who also failed once
- Year of dedicated preparation
- Overcoming self-doubt and pressure
- Second attempt: Success
- Realization: Failure taught more than success
- Message: Failures are stepping stones
60-70 dialogues with Narrator, Riya, Teacher, Mother, Father, Friend. Use emotions: DEVASTATED, HOPELESS, DETERMINED, FOCUSED, ANXIOUS, CONFIDENT, VICTORIOUS, GRATEFUL, INSPIRING`
  },
  {
    id: 44,
    title: 'Entrepreneur Ki Kahani',
    category: 'Motivation',
    emoji: '💪',
    plays: '6.4M',
    duration: '12:10',
    prompt: `Create a complete 12-13 minute Hindi motivational story about Neha building startup from scratch. Include:
- Setup: Neha's idea for education app
- Leaving stable job, family opposition
- Initial failures: No funding, team issues
- Learning from mistakes, pivoting
- Small wins building momentum
- Investor pitch success
- Scaling challenges and solutions
- Success: App reaches 1 million users
- Message: Believe in your vision
70-80 dialogues with Narrator, Neha, Father, Investor, Co-founder, Mentor. Use emotions: EXCITED, DOUBTFUL, DETERMINED, STRESSED, HOPEFUL, CONFIDENT, TRIUMPHANT, GRATEFUL, INSPIRING`
  }
]

console.log('📚 Complete Story Library Created!')
console.log(`\n✅ Total Stories: ${completeStories.length}`)
console.log('\n📊 Category Breakdown:')
console.log('   💕 Romance: 6 stories')
console.log('   👻 Horror: 5 stories')
console.log('   🔪 Thriller: 5 stories')
console.log('   😂 Comedy: 3 stories')
console.log('   🙏 Spiritual: 3 stories')
console.log('   💪 Motivation: 3 stories')
console.log('\n⏱️  Duration Range: 7-15 minutes')
console.log('💬 Dialogue Count: 40-105 lines per story')
console.log('\n🎯 These are complete story prompts ready for AI generation!')

module.exports = { completeStories }
