import { useReducer, useState, useRef, useEffect, useCallback } from 'react'

// Action types for the audio reducer
const ACTIONS = {
  SET_CURRENT_PLAYING: 'SET_CURRENT_PLAYING',
  SET_IS_PLAYING: 'SET_IS_PLAYING',
  SET_CURRENT_TIME: 'SET_CURRENT_TIME',
  SET_DURATION: 'SET_DURATION',
  SET_PLAYBACK_SPEED: 'SET_PLAYBACK_SPEED',
  SET_VOLUME: 'SET_VOLUME',
  SET_SLEEP_TIMER: 'SET_SLEEP_TIMER',
  SET_SLEEP_TIMER_MINUTES: 'SET_SLEEP_TIMER_MINUTES',
  PLAY_STORY: 'PLAY_STORY',
  STOP: 'STOP',
  TOGGLE_PLAY_PAUSE: 'TOGGLE_PLAY_PAUSE',
  SLEEP_TIMER_TICK: 'SLEEP_TIMER_TICK',
  CLEAR_SLEEP_TIMER: 'CLEAR_SLEEP_TIMER',
}

const initialAudioState = {
  currentPlaying: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackSpeed: 1,
  volume: 1,
  sleepTimer: null,
  sleepTimerMinutes: 0,
}

function audioReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_CURRENT_PLAYING:
      return { ...state, currentPlaying: action.payload }

    case ACTIONS.SET_IS_PLAYING:
      return { ...state, isPlaying: action.payload }

    case ACTIONS.SET_CURRENT_TIME:
      return { ...state, currentTime: action.payload }

    case ACTIONS.SET_DURATION:
      return { ...state, duration: action.payload }

    case ACTIONS.SET_PLAYBACK_SPEED:
      return { ...state, playbackSpeed: action.payload }

    case ACTIONS.SET_VOLUME:
      return { ...state, volume: action.payload }

    case ACTIONS.SET_SLEEP_TIMER:
      return { ...state, sleepTimer: action.payload }

    case ACTIONS.SET_SLEEP_TIMER_MINUTES:
      return { ...state, sleepTimerMinutes: action.payload }

    case ACTIONS.PLAY_STORY:
      return {
        ...state,
        currentPlaying: action.payload,
        isPlaying: true,
      }

    case ACTIONS.STOP:
      return {
        ...state,
        currentPlaying: null,
        isPlaying: false,
      }

    case ACTIONS.TOGGLE_PLAY_PAUSE:
      return { ...state, isPlaying: !state.isPlaying }

    case ACTIONS.SLEEP_TIMER_TICK:
      return {
        ...state,
        sleepTimer: action.payload,
      }

    case ACTIONS.CLEAR_SLEEP_TIMER:
      return {
        ...state,
        sleepTimer: null,
        sleepTimerMinutes: 0,
      }

    default:
      return state
  }
}

export default function useAudio({ onAddToHistory }) {
  const [state, dispatch] = useReducer(audioReducer, initialAudioState)

  // UI-only state kept as separate useState
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

  // Refs
  const audioRef = useRef(null)
  const sleepTimerRef = useRef(null)

  // Audio event listeners (timeupdate, loadedmetadata, ended)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => dispatch({ type: ACTIONS.SET_CURRENT_TIME, payload: audio.currentTime })
    const updateDuration = () => dispatch({ type: ACTIONS.SET_DURATION, payload: audio.duration })
    const handleEnded = () => dispatch({ type: ACTIONS.SET_IS_PLAYING, payload: false })

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const playStory = useCallback(async (story) => {
    dispatch({ type: ACTIONS.SET_CURRENT_PLAYING, payload: story })

    // Add to history via callback
    if (onAddToHistory) {
      onAddToHistory(story.id)
    }

    // Check if story has pre-generated audio
    if (story.generated && (story.audioPath || story.audioUrl)) {
      const audio = audioRef.current
      // Force reload audio by pausing, resetting, and loading new src
      audio.pause()
      audio.currentTime = 0
      audio.src = story.audioPath || story.audioUrl
      audio.load() // Force reload from src
      audio.play().catch(err => console.error('Audio play error:', err))
      dispatch({ type: ACTIONS.SET_IS_PLAYING, payload: true })
      return
    }

    // If not generated, show message
    alert(`Story "${story.title}" is not ready yet!\n\nPlease run: npm run generate\n\nThis will pre-generate all stories with AI.`)
    dispatch({ type: ACTIONS.SET_CURRENT_PLAYING, payload: null })
  }, [onAddToHistory])

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current
    if (state.isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    dispatch({ type: ACTIONS.TOGGLE_PLAY_PAUSE })
  }, [state.isPlaying])

  const seekTo = useCallback((e) => {
    const audio = audioRef.current
    const progressBar = e.currentTarget
    const rect = progressBar.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    audio.currentTime = percentage * audio.duration
  }, [])

  const formatTime = useCallback((seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  const changePlaybackSpeed = useCallback((speed) => {
    const audio = audioRef.current
    if (audio) {
      audio.playbackRate = speed
      dispatch({ type: ACTIONS.SET_PLAYBACK_SPEED, payload: speed })
      setShowSpeedMenu(false)
    }
  }, [])

  const changeVolume = useCallback((newVolume) => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = newVolume
      dispatch({ type: ACTIONS.SET_VOLUME, payload: newVolume })
    }
  }, [])

  const skipForward = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !audio.src) {
      console.warn('No audio loaded')
      return
    }

    const wasPlaying = !audio.paused
    const currentPosition = audio.currentTime || 0
    const targetTime = Math.min(currentPosition + 10, (audio.duration || 0) - 1)

    console.log(`Forward: ${currentPosition.toFixed(2)}s -> ${targetTime.toFixed(2)}s`)

    // Seek completed handler
    const handleSeeked = () => {
      audio.removeEventListener('seeked', handleSeeked)
      if (wasPlaying) {
        audio.play().catch(err => console.error('Play error:', err))
        dispatch({ type: ACTIONS.SET_IS_PLAYING, payload: true })
      }
      console.log(`Seeked to ${audio.currentTime.toFixed(2)}s`)
    }

    // Add seeked event listener
    audio.addEventListener('seeked', handleSeeked)

    // Pause and seek
    if (wasPlaying) {
      audio.pause()
      dispatch({ type: ACTIONS.SET_IS_PLAYING, payload: false })
    }

    // Perform the seek
    try {
      audio.currentTime = targetTime
    } catch (err) {
      console.error('Seek error:', err)
      audio.removeEventListener('seeked', handleSeeked)
      if (wasPlaying) {
        audio.play()
        dispatch({ type: ACTIONS.SET_IS_PLAYING, payload: true })
      }
    }
  }, [])

  const skipBackward = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !audio.src) {
      console.warn('No audio loaded')
      return
    }

    const wasPlaying = !audio.paused
    const currentPosition = audio.currentTime || 0
    const targetTime = Math.max(currentPosition - 10, 0)

    console.log(`Backward: ${currentPosition.toFixed(2)}s -> ${targetTime.toFixed(2)}s`)

    // Seek completed handler
    const handleSeeked = () => {
      audio.removeEventListener('seeked', handleSeeked)
      if (wasPlaying) {
        audio.play().catch(err => console.error('Play error:', err))
        dispatch({ type: ACTIONS.SET_IS_PLAYING, payload: true })
      }
      console.log(`Seeked to ${audio.currentTime.toFixed(2)}s`)
    }

    // Add seeked event listener
    audio.addEventListener('seeked', handleSeeked)

    // Pause and seek
    if (wasPlaying) {
      audio.pause()
      dispatch({ type: ACTIONS.SET_IS_PLAYING, payload: false })
    }

    // Perform the seek
    try {
      audio.currentTime = targetTime
    } catch (err) {
      console.error('Seek error:', err)
      audio.removeEventListener('seeked', handleSeeked)
      if (wasPlaying) {
        audio.play()
        dispatch({ type: ACTIONS.SET_IS_PLAYING, payload: true })
      }
    }
  }, [])

  const setSleepTimerFunc = useCallback((minutes) => {
    // Clear existing timer
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current)
    }

    if (minutes === 0) {
      dispatch({ type: ACTIONS.CLEAR_SLEEP_TIMER })
      return
    }

    dispatch({ type: ACTIONS.SET_SLEEP_TIMER_MINUTES, payload: minutes })
    const endTime = Date.now() + minutes * 60 * 1000

    // Update timer every second
    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000 / 60))
      dispatch({ type: ACTIONS.SLEEP_TIMER_TICK, payload: remaining })

      if (remaining <= 0) {
        const audio = audioRef.current
        if (audio) {
          audio.pause()
          dispatch({ type: ACTIONS.SET_IS_PLAYING, payload: false })
        }
        dispatch({ type: ACTIONS.CLEAR_SLEEP_TIMER })
      } else {
        sleepTimerRef.current = setTimeout(updateTimer, 1000)
      }
    }

    updateTimer()
  }, [])

  // Close the player entirely: pause audio and clear state
  const closePlayer = useCallback(() => {
    audioRef.current.pause()
    dispatch({ type: ACTIONS.STOP })
  }, [])

  return {
    // State values (from reducer)
    currentPlaying: state.currentPlaying,
    isPlaying: state.isPlaying,
    currentTime: state.currentTime,
    duration: state.duration,
    playbackSpeed: state.playbackSpeed,
    volume: state.volume,
    sleepTimer: state.sleepTimer,
    sleepTimerMinutes: state.sleepTimerMinutes,

    // UI-only state (separate useState)
    showSpeedMenu,
    setShowSpeedMenu,
    showVolumeSlider,
    setShowVolumeSlider,

    // Refs
    audioRef,
    sleepTimerRef,

    // Functions
    playStory,
    togglePlayPause,
    seekTo,
    formatTime,
    changePlaybackSpeed,
    changeVolume,
    skipForward,
    skipBackward,
    setSleepTimerFunc,
    closePlayer,
  }
}
