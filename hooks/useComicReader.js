import { useReducer, useState, useRef, useEffect, useCallback } from 'react'

// Action types
const ACTIONS = {
  LOAD_COMIC: 'LOAD_COMIC',
  NEXT_PANEL: 'NEXT_PANEL',
  PREV_PANEL: 'PREV_PANEL',
  GO_TO_PANEL: 'GO_TO_PANEL',
  SET_VIEW_MODE: 'SET_VIEW_MODE',
  SET_AUTO_ADVANCE: 'SET_AUTO_ADVANCE',
  SET_AUDIO_PLAYING: 'SET_AUDIO_PLAYING',
  SET_AUDIO_TIME: 'SET_AUDIO_TIME',
  SET_AUDIO_DURATION: 'SET_AUDIO_DURATION',
  SET_UI_VISIBLE: 'SET_UI_VISIBLE',
  COMPLETE: 'COMPLETE',
  RESTART: 'RESTART',
  RESTORE_PROGRESS: 'RESTORE_PROGRESS',
}

const initialState = {
  comic: null,
  currentPanel: 0,
  panelsRead: 0,
  viewMode: 'swipe', // 'swipe' | 'scroll'
  autoAdvance: false,
  uiVisible: true,
  isComplete: false,
  // Audio state for current panel
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  // Reading time tracking
  startTime: null,
  readingTimeSeconds: 0,
}

function comicReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOAD_COMIC: {
      const comic = action.payload
      return {
        ...state,
        comic,
        currentPanel: 0,
        panelsRead: 1,
        isComplete: false,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        startTime: Date.now(),
        readingTimeSeconds: 0,
      }
    }

    case ACTIONS.NEXT_PANEL: {
      if (!state.comic) return state
      const totalPanels = state.comic.panels.length
      const nextPanel = state.currentPanel + 1

      if (nextPanel >= totalPanels) {
        // Reached the end
        return {
          ...state,
          isComplete: true,
          panelsRead: totalPanels,
          readingTimeSeconds: Math.round((Date.now() - (state.startTime || Date.now())) / 1000),
          isPlaying: false,
          currentTime: 0,
          duration: 0,
        }
      }

      return {
        ...state,
        currentPanel: nextPanel,
        panelsRead: Math.max(state.panelsRead, nextPanel + 1),
        isPlaying: false,
        currentTime: 0,
        duration: 0,
      }
    }

    case ACTIONS.PREV_PANEL: {
      if (!state.comic || state.currentPanel <= 0) return state
      return {
        ...state,
        currentPanel: state.currentPanel - 1,
        isComplete: false,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
      }
    }

    case ACTIONS.GO_TO_PANEL: {
      if (!state.comic) return state
      const panel = Math.max(0, Math.min(action.payload, state.comic.panels.length - 1))
      return {
        ...state,
        currentPanel: panel,
        panelsRead: Math.max(state.panelsRead, panel + 1),
        isComplete: false,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
      }
    }

    case ACTIONS.SET_VIEW_MODE:
      return { ...state, viewMode: action.payload }

    case ACTIONS.SET_AUTO_ADVANCE:
      return { ...state, autoAdvance: action.payload }

    case ACTIONS.SET_AUDIO_PLAYING:
      return { ...state, isPlaying: action.payload }

    case ACTIONS.SET_AUDIO_TIME:
      return { ...state, currentTime: action.payload }

    case ACTIONS.SET_AUDIO_DURATION:
      return { ...state, duration: action.payload }

    case ACTIONS.SET_UI_VISIBLE:
      return { ...state, uiVisible: action.payload }

    case ACTIONS.COMPLETE:
      return {
        ...state,
        isComplete: true,
        panelsRead: state.comic ? state.comic.panels.length : state.panelsRead,
        readingTimeSeconds: Math.round((Date.now() - (state.startTime || Date.now())) / 1000),
      }

    case ACTIONS.RESTART:
      return {
        ...state,
        currentPanel: 0,
        panelsRead: 1,
        isComplete: false,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        startTime: Date.now(),
        readingTimeSeconds: 0,
      }

    case ACTIONS.RESTORE_PROGRESS: {
      const { progress, comic } = action.payload
      return {
        ...state,
        comic,
        currentPanel: Math.min(progress.currentPanel || 0, comic.panels.length - 1),
        panelsRead: progress.panelsRead || 0,
        isComplete: progress.completed || false,
        readingTimeSeconds: progress.readingTimeSeconds || 0,
        startTime: Date.now(),
        isPlaying: false,
        currentTime: 0,
        duration: 0,
      }
    }

    default:
      return state
  }
}

export default function useComicReader() {
  const [state, dispatch] = useReducer(comicReducer, initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const audioRef = useRef(null)

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => dispatch({ type: ACTIONS.SET_AUDIO_TIME, payload: audio.currentTime })
    const updateDuration = () => dispatch({ type: ACTIONS.SET_AUDIO_DURATION, payload: audio.duration })
    const handleEnded = () => {
      dispatch({ type: ACTIONS.SET_AUDIO_PLAYING, payload: false })
      // Auto-advance to next panel when audio ends
      if (state.autoAdvance) {
        setTimeout(() => dispatch({ type: ACTIONS.NEXT_PANEL }), 500)
      }
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [state.autoAdvance])

  // Load comic from API
  const loadComic = useCallback(async (comicId) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/comics/${comicId}`)
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Failed to load comic')

      const comic = data.comic

      // Sort panels by order
      if (comic.panels) {
        comic.panels.sort((a, b) => a.order - b.order)
      }

      // Check localStorage for saved progress
      const savedProgress = localStorage.getItem(`comic_progress_${comicId}`)
      if (savedProgress) {
        try {
          const progress = JSON.parse(savedProgress)
          if (progress.panelsRead > 0) {
            dispatch({ type: ACTIONS.RESTORE_PROGRESS, payload: { progress, comic } })
            setLoading(false)
            return
          }
        } catch (e) {
          // Invalid saved progress, start fresh
        }
      }

      dispatch({ type: ACTIONS.LOAD_COMIC, payload: comic })
    } catch (err) {
      console.error('Failed to load comic:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Navigate panels
  const nextPanel = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    dispatch({ type: ACTIONS.NEXT_PANEL })
  }, [])

  const prevPanel = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    dispatch({ type: ACTIONS.PREV_PANEL })
  }, [])

  const goToPanel = useCallback((index) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    dispatch({ type: ACTIONS.GO_TO_PANEL, payload: index })
  }, [])

  // Toggle audio for current panel
  const toggleAudio = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    const currentPanelData = state.comic?.panels?.[state.currentPanel]
    if (!currentPanelData?.audioUrl) return

    if (state.isPlaying) {
      audio.pause()
      dispatch({ type: ACTIONS.SET_AUDIO_PLAYING, payload: false })
    } else {
      // If src changed, reload
      if (audio.src !== currentPanelData.audioUrl) {
        audio.src = currentPanelData.audioUrl
        audio.load()
      }
      audio.play().catch(err => console.error('Audio play error:', err))
      dispatch({ type: ACTIONS.SET_AUDIO_PLAYING, payload: true })
    }
  }, [state.isPlaying, state.comic, state.currentPanel])

  // Load audio for current panel when it changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !state.comic) return

    const panel = state.comic.panels[state.currentPanel]
    if (panel?.audioUrl) {
      audio.src = panel.audioUrl
      audio.load()
    }
  }, [state.currentPanel, state.comic])

  // Preload next/prev panel images for smoother transitions
  useEffect(() => {
    if (!state.comic?.panels) return
    const panels = state.comic.panels
    const curr = state.currentPanel

    const toPreload = [curr - 1, curr + 1, curr + 2].filter(
      i => i >= 0 && i < panels.length && panels[i]?.imageUrl
    )

    toPreload.forEach(i => {
      const img = new Image()
      img.src = panels[i].imageUrl
    })
  }, [state.currentPanel, state.comic])

  // View mode & UI toggles
  const setViewMode = useCallback((mode) => {
    dispatch({ type: ACTIONS.SET_VIEW_MODE, payload: mode })
  }, [])

  const toggleAutoAdvance = useCallback(() => {
    dispatch({ type: ACTIONS.SET_AUTO_ADVANCE, payload: !state.autoAdvance })
  }, [state.autoAdvance])

  const toggleUI = useCallback(() => {
    dispatch({ type: ACTIONS.SET_UI_VISIBLE, payload: !state.uiVisible })
  }, [state.uiVisible])

  // Restart
  const restart = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    dispatch({ type: ACTIONS.RESTART })
  }, [])

  // Save progress to localStorage
  useEffect(() => {
    if (!state.comic) return

    const progress = {
      comicId: state.comic.id,
      currentPanel: state.currentPanel,
      panelsRead: state.panelsRead,
      completed: state.isComplete,
      readingTimeSeconds: state.readingTimeSeconds ||
        Math.round((Date.now() - (state.startTime || Date.now())) / 1000),
    }

    localStorage.setItem(
      `comic_progress_${state.comic.id}`,
      JSON.stringify(progress)
    )
  }, [state.currentPanel, state.panelsRead, state.isComplete, state.comic])

  // Current panel data helper
  const currentPanelData = state.comic?.panels?.[state.currentPanel] || null
  const totalPanels = state.comic?.panels?.length || 0
  const hasNextPanel = state.currentPanel < totalPanels - 1
  const hasPrevPanel = state.currentPanel > 0
  const currentPanelHasAudio = !!(currentPanelData?.audioUrl)

  return {
    // State
    comic: state.comic,
    currentPanel: state.currentPanel,
    currentPanelData,
    totalPanels,
    panelsRead: state.panelsRead,
    viewMode: state.viewMode,
    autoAdvance: state.autoAdvance,
    uiVisible: state.uiVisible,
    isComplete: state.isComplete,
    isPlaying: state.isPlaying,
    currentTime: state.currentTime,
    duration: state.duration,
    readingTimeSeconds: state.readingTimeSeconds,
    hasNextPanel,
    hasPrevPanel,
    currentPanelHasAudio,
    loading,
    error,
    // Refs
    audioRef,
    // Functions
    loadComic,
    nextPanel,
    prevPanel,
    goToPanel,
    toggleAudio,
    setViewMode,
    toggleAutoAdvance,
    toggleUI,
    restart,
  }
}
