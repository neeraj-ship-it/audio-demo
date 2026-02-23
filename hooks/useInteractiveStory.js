import { useReducer, useState, useRef, useEffect, useCallback } from 'react'

// Action types
const ACTIONS = {
  LOAD_STORY: 'LOAD_STORY',
  GO_TO_SCENE: 'GO_TO_SCENE',
  MAKE_CHOICE: 'MAKE_CHOICE',
  SET_AUDIO_PLAYING: 'SET_AUDIO_PLAYING',
  SET_AUDIO_TIME: 'SET_AUDIO_TIME',
  SET_AUDIO_DURATION: 'SET_AUDIO_DURATION',
  SET_TRANSITIONING: 'SET_TRANSITIONING',
  REACH_ENDING: 'REACH_ENDING',
  RESTART: 'RESTART',
  RESTORE_PROGRESS: 'RESTORE_PROGRESS',
}

const initialState = {
  story: null,
  currentScene: null,
  currentSceneId: null,
  choiceHistory: [],
  endingsDiscovered: [],
  scenesVisited: [],
  completionPercentage: 0,
  totalChoicesMade: 0,
  isTransitioning: false,
  isEnding: false,
  // Audio state for current scene
  isPlaying: false,
  currentTime: 0,
  duration: 0,
}

function interactiveReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOAD_STORY: {
      const story = action.payload
      const startScene = story.scenes[story.startScene]
      return {
        ...state,
        story,
        currentScene: startScene,
        currentSceneId: story.startScene,
        scenesVisited: [story.startScene],
        choiceHistory: [],
        endingsDiscovered: [],
        completionPercentage: 0,
        totalChoicesMade: 0,
        isEnding: false,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
      }
    }

    case ACTIONS.GO_TO_SCENE: {
      const sceneId = action.payload
      const scene = state.story.scenes[sceneId]
      if (!scene) return state

      const newVisited = state.scenesVisited.includes(sceneId)
        ? state.scenesVisited
        : [...state.scenesVisited, sceneId]

      const totalScenes = Object.keys(state.story.scenes).length
      const nonEndingScenes = Object.values(state.story.scenes).filter(s => !s.isEnding).length
      const visitedNonEnding = newVisited.filter(id => !state.story.scenes[id]?.isEnding).length
      const completion = Math.round((visitedNonEnding / nonEndingScenes) * 100)

      return {
        ...state,
        currentScene: scene,
        currentSceneId: sceneId,
        scenesVisited: newVisited,
        completionPercentage: Math.min(completion, 100),
        isTransitioning: false,
        isEnding: scene.isEnding || false,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
      }
    }

    case ACTIONS.MAKE_CHOICE: {
      const { choiceId, nextScene } = action.payload
      return {
        ...state,
        choiceHistory: [
          ...state.choiceHistory,
          {
            sceneId: state.currentSceneId,
            choiceId,
            timestamp: new Date().toISOString(),
          }
        ],
        totalChoicesMade: state.totalChoicesMade + 1,
        isTransitioning: true,
      }
    }

    case ACTIONS.SET_AUDIO_PLAYING:
      return { ...state, isPlaying: action.payload }

    case ACTIONS.SET_AUDIO_TIME:
      return { ...state, currentTime: action.payload }

    case ACTIONS.SET_AUDIO_DURATION:
      return { ...state, duration: action.payload }

    case ACTIONS.SET_TRANSITIONING:
      return { ...state, isTransitioning: action.payload }

    case ACTIONS.REACH_ENDING: {
      const endingId = action.payload
      const newEndings = state.endingsDiscovered.includes(endingId)
        ? state.endingsDiscovered
        : [...state.endingsDiscovered, endingId]
      return {
        ...state,
        endingsDiscovered: newEndings,
        isEnding: true,
      }
    }

    case ACTIONS.RESTART: {
      const story = state.story
      if (!story) return state
      const startScene = story.scenes[story.startScene]
      return {
        ...state,
        currentScene: startScene,
        currentSceneId: story.startScene,
        scenesVisited: [story.startScene],
        choiceHistory: [],
        completionPercentage: 0,
        totalChoicesMade: 0,
        isEnding: false,
        isTransitioning: false,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        // Keep endingsDiscovered across restarts
      }
    }

    case ACTIONS.RESTORE_PROGRESS: {
      const { progress, story } = action.payload
      const scene = story.scenes[progress.currentScene]
      if (!scene) return state

      return {
        ...state,
        story,
        currentScene: scene,
        currentSceneId: progress.currentScene,
        choiceHistory: progress.choiceHistory || [],
        endingsDiscovered: progress.endingsDiscovered || [],
        scenesVisited: progress.choiceHistory
          ? [story.startScene, ...progress.choiceHistory.map(c => c.sceneId), progress.currentScene]
          : [progress.currentScene],
        completionPercentage: progress.completionPercentage || 0,
        totalChoicesMade: progress.totalChoicesMade || 0,
        isEnding: scene.isEnding || false,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
      }
    }

    default:
      return state
  }
}

export default function useInteractiveStory() {
  const [state, dispatch] = useReducer(interactiveReducer, initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const audioRef = useRef(null)

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => dispatch({ type: ACTIONS.SET_AUDIO_TIME, payload: audio.currentTime })
    const updateDuration = () => dispatch({ type: ACTIONS.SET_AUDIO_DURATION, payload: audio.duration })
    const handleEnded = () => dispatch({ type: ACTIONS.SET_AUDIO_PLAYING, payload: false })

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Load story from API
  const loadStory = useCallback(async (storyId) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/interactive/${storyId}`)
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Failed to load story')

      const story = data.story

      // Check localStorage for saved progress
      const savedProgress = localStorage.getItem(`interactive_progress_${storyId}`)
      if (savedProgress) {
        try {
          const progress = JSON.parse(savedProgress)
          dispatch({ type: ACTIONS.RESTORE_PROGRESS, payload: { progress, story } })
          setLoading(false)
          return
        } catch (e) {
          // Invalid saved progress, start fresh
        }
      }

      dispatch({ type: ACTIONS.LOAD_STORY, payload: story })
    } catch (err) {
      console.error('Failed to load interactive story:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Make a choice and navigate to next scene
  const makeChoice = useCallback((choice) => {
    if (!state.story || state.isTransitioning) return

    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    // Record choice
    dispatch({
      type: ACTIONS.MAKE_CHOICE,
      payload: { choiceId: choice.id, nextScene: choice.nextScene }
    })

    // Transition delay for animation
    setTimeout(() => {
      dispatch({ type: ACTIONS.GO_TO_SCENE, payload: choice.nextScene })

      // Check if ending
      const nextScene = state.story.scenes[choice.nextScene]
      if (nextScene && nextScene.isEnding) {
        dispatch({ type: ACTIONS.REACH_ENDING, payload: choice.nextScene })
      }

      // Play audio for next scene if available
      const scene = state.story.scenes[choice.nextScene]
      if (scene && scene.audioUrl && audioRef.current) {
        audioRef.current.src = scene.audioUrl
        audioRef.current.load()
        audioRef.current.play().catch(err => console.error('Audio play error:', err))
        dispatch({ type: ACTIONS.SET_AUDIO_PLAYING, payload: true })
      }
    }, 600) // Match CSS transition duration
  }, [state.story, state.isTransitioning])

  // Toggle audio play/pause
  const toggleAudio = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !audio.src) return

    if (state.isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(err => console.error('Audio play error:', err))
    }
    dispatch({ type: ACTIONS.SET_AUDIO_PLAYING, payload: !state.isPlaying })
  }, [state.isPlaying])

  // Play scene audio
  const playSceneAudio = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !state.currentScene?.audioUrl) return

    audio.src = state.currentScene.audioUrl
    audio.load()
    audio.play().catch(err => console.error('Audio play error:', err))
    dispatch({ type: ACTIONS.SET_AUDIO_PLAYING, payload: true })
  }, [state.currentScene])

  // Restart story
  const restart = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    dispatch({ type: ACTIONS.RESTART })
  }, [])

  // Save progress to localStorage
  useEffect(() => {
    if (!state.story || !state.currentSceneId) return

    const progress = {
      storyId: state.story.id,
      currentScene: state.currentSceneId,
      choiceHistory: state.choiceHistory,
      endingsDiscovered: state.endingsDiscovered,
      completionPercentage: state.completionPercentage,
      totalChoicesMade: state.totalChoicesMade,
    }

    localStorage.setItem(
      `interactive_progress_${state.story.id}`,
      JSON.stringify(progress)
    )
  }, [state.currentSceneId, state.choiceHistory, state.endingsDiscovered, state.story])

  // Format time helper
  const formatTime = useCallback((seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  return {
    // State
    story: state.story,
    currentScene: state.currentScene,
    currentSceneId: state.currentSceneId,
    choiceHistory: state.choiceHistory,
    endingsDiscovered: state.endingsDiscovered,
    scenesVisited: state.scenesVisited,
    completionPercentage: state.completionPercentage,
    totalChoicesMade: state.totalChoicesMade,
    isTransitioning: state.isTransitioning,
    isEnding: state.isEnding,
    isPlaying: state.isPlaying,
    currentTime: state.currentTime,
    duration: state.duration,
    loading,
    error,
    // Refs
    audioRef,
    // Functions
    loadStory,
    makeChoice,
    toggleAudio,
    playSceneAudio,
    restart,
    formatTime,
  }
}
