import { renderHook } from '@testing-library/react'
import useAudio from '../../hooks/useAudio'

describe('useAudio hook', () => {
  describe('initial state values', () => {
    it('should have isPlaying as false', () => {
      const { result } = renderHook(() => useAudio({ onAddToHistory: jest.fn() }))
      expect(result.current.isPlaying).toBe(false)
    })

    it('should have volume as 1', () => {
      const { result } = renderHook(() => useAudio({ onAddToHistory: jest.fn() }))
      expect(result.current.volume).toBe(1)
    })

    it('should have currentTime as 0', () => {
      const { result } = renderHook(() => useAudio({ onAddToHistory: jest.fn() }))
      expect(result.current.currentTime).toBe(0)
    })

    it('should have duration as 0', () => {
      const { result } = renderHook(() => useAudio({ onAddToHistory: jest.fn() }))
      expect(result.current.duration).toBe(0)
    })

    it('should have playbackSpeed as 1', () => {
      const { result } = renderHook(() => useAudio({ onAddToHistory: jest.fn() }))
      expect(result.current.playbackSpeed).toBe(1)
    })

    it('should have currentPlaying as null', () => {
      const { result } = renderHook(() => useAudio({ onAddToHistory: jest.fn() }))
      expect(result.current.currentPlaying).toBeNull()
    })

    it('should have sleepTimer as null', () => {
      const { result } = renderHook(() => useAudio({ onAddToHistory: jest.fn() }))
      expect(result.current.sleepTimer).toBeNull()
    })

    it('should have sleepTimerMinutes as 0', () => {
      const { result } = renderHook(() => useAudio({ onAddToHistory: jest.fn() }))
      expect(result.current.sleepTimerMinutes).toBe(0)
    })
  })

  describe('formatTime', () => {
    let formatTime

    beforeEach(() => {
      const { result } = renderHook(() => useAudio({ onAddToHistory: jest.fn() }))
      formatTime = result.current.formatTime
    })

    it('should format 0 seconds as "0:00"', () => {
      expect(formatTime(0)).toBe('0:00')
    })

    it('should format 90 seconds as "1:30"', () => {
      expect(formatTime(90)).toBe('1:30')
    })

    it('should format NaN as "0:00"', () => {
      expect(formatTime(NaN)).toBe('0:00')
    })

    it('should format undefined as "0:00"', () => {
      expect(formatTime(undefined)).toBe('0:00')
    })

    it('should format 61 seconds as "1:01"', () => {
      expect(formatTime(61)).toBe('1:01')
    })

    it('should format 3661 seconds as "61:01"', () => {
      expect(formatTime(3661)).toBe('61:01')
    })
  })
})
