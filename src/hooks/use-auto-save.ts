import { useEffect, useRef, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

export interface AutoSaveState {
  lastSavedAt: number
  currentPosition: {
    courseId: string
    moduleId?: string
    lessonId?: string
    blockId?: string
    scrollPosition?: number
  }
  answeredQuestions: { [questionId: string]: number | number[] }
  timeSpentSeconds: number
  lessonProgress: { [lessonId: string]: string[] }
  videoProgress: { [videoId: string]: number }
  attemptData: any
}

export interface AutoSaveOptions {
  enabled?: boolean
  intervalSeconds?: number
  saveOnEveryAction?: boolean
  showNotifications?: boolean
}

const DEFAULT_OPTIONS: AutoSaveOptions = {
  enabled: true,
  intervalSeconds: 30,
  saveOnEveryAction: true,
  showNotifications: false,
}

export function useAutoSave(
  stateKey: string,
  options: AutoSaveOptions = DEFAULT_OPTIONS
) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
  const [saveState, setSaveState] = useKV<AutoSaveState | null>(
    `autosave-${stateKey}`,
    null
  )
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const pendingSaveRef = useRef<AutoSaveState | null>(null)
  const lastManualSaveRef = useRef<number>(0)
  
  const saveNow = useCallback((state: Partial<AutoSaveState>, showToast = false) => {
    const timestamp = Date.now()
    
    setSaveState((current) => {
      const updated = {
        ...(current || {
          lastSavedAt: 0,
          currentPosition: { courseId: '' },
          answeredQuestions: {},
          timeSpentSeconds: 0,
          lessonProgress: {},
          videoProgress: {},
          attemptData: null,
        }),
        ...state,
        lastSavedAt: timestamp,
      }
      
      pendingSaveRef.current = null
      lastManualSaveRef.current = timestamp
      
      if (showToast && mergedOptions.showNotifications) {
        toast.success('Progress saved', {
          duration: 2000,
          className: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
        })
      }
      
      return updated
    })
  }, [setSaveState, mergedOptions.showNotifications])
  
  const updatePosition = useCallback((position: AutoSaveState['currentPosition']) => {
    const state: Partial<AutoSaveState> = { currentPosition: position }
    
    if (mergedOptions.saveOnEveryAction) {
      saveNow(state, false)
    } else {
      pendingSaveRef.current = { ...(pendingSaveRef.current || {}), ...state } as AutoSaveState
    }
  }, [saveNow, mergedOptions.saveOnEveryAction])
  
  const updateQuestionAnswer = useCallback((questionId: string, answer: number | number[]) => {
    const state: Partial<AutoSaveState> = {
      answeredQuestions: {
        ...(saveState?.answeredQuestions || {}),
        [questionId]: answer,
      },
    }
    
    if (mergedOptions.saveOnEveryAction) {
      saveNow(state, false)
    } else {
      pendingSaveRef.current = { ...(pendingSaveRef.current || {}), ...state } as AutoSaveState
    }
  }, [saveNow, saveState?.answeredQuestions, mergedOptions.saveOnEveryAction])
  
  const updateLessonProgress = useCallback((lessonId: string, completedBlocks: string[]) => {
    const state: Partial<AutoSaveState> = {
      lessonProgress: {
        ...(saveState?.lessonProgress || {}),
        [lessonId]: completedBlocks,
      },
    }
    
    if (mergedOptions.saveOnEveryAction) {
      saveNow(state, false)
    } else {
      pendingSaveRef.current = { ...(pendingSaveRef.current || {}), ...state } as AutoSaveState
    }
  }, [saveNow, saveState?.lessonProgress, mergedOptions.saveOnEveryAction])
  
  const updateVideoProgress = useCallback((videoId: string, currentTime: number) => {
    const state: Partial<AutoSaveState> = {
      videoProgress: {
        ...(saveState?.videoProgress || {}),
        [videoId]: currentTime,
      },
    }
    
    if (mergedOptions.saveOnEveryAction) {
      saveNow(state, false)
    } else {
      pendingSaveRef.current = { ...(pendingSaveRef.current || {}), ...state } as AutoSaveState
    }
  }, [saveNow, saveState?.videoProgress, mergedOptions.saveOnEveryAction])
  
  const updateTimeSpent = useCallback((seconds: number) => {
    setSaveState((current) => ({
      ...(current || {
        lastSavedAt: Date.now(),
        currentPosition: { courseId: '' },
        answeredQuestions: {},
        timeSpentSeconds: 0,
        lessonProgress: {},
        videoProgress: {},
        attemptData: null,
      }),
      timeSpentSeconds: (current?.timeSpentSeconds || 0) + seconds,
    }))
  }, [setSaveState])
  
  const clearSaveState = useCallback(() => {
    setSaveState(null)
    pendingSaveRef.current = null
  }, [setSaveState])
  
  useEffect(() => {
    if (!mergedOptions.enabled) return
    
    if (mergedOptions.saveOnEveryAction) return
    
    intervalRef.current = setInterval(() => {
      if (pendingSaveRef.current) {
        saveNow(pendingSaveRef.current, false)
      }
    }, mergedOptions.intervalSeconds! * 1000)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      
      if (pendingSaveRef.current) {
        saveNow(pendingSaveRef.current, false)
      }
    }
  }, [mergedOptions.enabled, mergedOptions.intervalSeconds, mergedOptions.saveOnEveryAction, saveNow])
  
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pendingSaveRef.current) {
        saveNow(pendingSaveRef.current, false)
      }
    }
    
    const handleVisibilityChange = () => {
      if (document.hidden && pendingSaveRef.current) {
        saveNow(pendingSaveRef.current, false)
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [saveNow])
  
  return {
    saveState,
    saveNow: (state: Partial<AutoSaveState>) => saveNow(state, true),
    updatePosition,
    updateQuestionAnswer,
    updateLessonProgress,
    updateVideoProgress,
    updateTimeSpent,
    clearSaveState,
    lastSavedAt: saveState?.lastSavedAt || 0,
  }
}
