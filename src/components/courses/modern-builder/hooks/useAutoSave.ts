import { useEffect, useRef, useState, useCallback } from 'react'

interface UseAutoSaveOptions<T> {
  key: string
  data: T
  onSave: (data: T) => Promise<void>
  interval?: number // localStorage interval in ms, default 30000 (30s)
  backendInterval?: number // backend auto-save interval in ms, default 60000 (60s)
  enabled?: boolean // Allow disabling auto-save
}

export function useAutoSave<T>({ 
  key, 
  data, 
  onSave, 
  interval = 30000,
  backendInterval = 60000,
  enabled = true 
}: UseAutoSaveOptions<T>) {
  const [lastSaved, setLastSaved] = useState<number | null>(null)
  const [lastSavedBackend, setLastSavedBackend] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const initialDataRef = useRef<string>(JSON.stringify(data))
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const backendTimerRef = useRef<NodeJS.Timeout | null>(null)
  const dataRef = useRef<T>(data)
  const isSavingRef = useRef(false)
  const isDirtyRef = useRef(false)

  // Keep refs in sync
  useEffect(() => { dataRef.current = data }, [data])
  useEffect(() => { isSavingRef.current = isSaving }, [isSaving])
  useEffect(() => { isDirtyRef.current = isDirty }, [isDirty])
  
  // Detect changes
  useEffect(() => {
    const currentData = JSON.stringify(data)
    if (currentData !== initialDataRef.current) {
      setIsDirty(true)
    }
  }, [data])
  
  // Auto-save to localStorage only (does NOT mark as saved to backend)
  useEffect(() => {
    if (isDirty && enabled) {
      // Clear existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      
      // Set new timer
      timerRef.current = setTimeout(() => {
        try {
          localStorage.setItem(key, JSON.stringify(data))
          // Only update lastSaved (local), NOT lastSavedBackend
          setLastSaved(Date.now())
          console.log('[AutoSave] Saved to localStorage at', new Date().toLocaleTimeString())
        } catch (error) {
          console.error('[AutoSave] Failed to save to localStorage:', error)
        }
      }, interval)
      
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current)
        }
      }
    }
  }, [data, isDirty, interval, key, enabled])

  // Periodic auto-save to backend
  const doBackendAutoSave = useCallback(async () => {
    if (!isDirtyRef.current || isSavingRef.current) return
    isSavingRef.current = true
    setIsSaving(true)
    try {
      await onSave(dataRef.current)
      const now = Date.now()
      setLastSaved(now)
      setLastSavedBackend(now)
      setIsDirty(false)
      isDirtyRef.current = false
      initialDataRef.current = JSON.stringify(dataRef.current)
      localStorage.setItem(key, JSON.stringify(dataRef.current))
      console.log('[AutoSave] Auto-saved to backend at', new Date().toLocaleTimeString())
    } catch (error) {
      console.error('[AutoSave] Backend auto-save failed:', error)
    } finally {
      isSavingRef.current = false
      setIsSaving(false)
    }
  }, [onSave, key])

  useEffect(() => {
    if (!enabled) return
    backendTimerRef.current = setInterval(doBackendAutoSave, backendInterval)
    return () => {
      if (backendTimerRef.current) clearInterval(backendTimerRef.current)
    }
  }, [enabled, backendInterval, doBackendAutoSave])
  
  // Manual save to backend
  const saveToBackend = async () => {
    if (isSaving) {
      console.log('[AutoSave] Save already in progress, skipping')
      return
    }
    
    setIsSaving(true)
    try {
      await onSave(data)
      const now = Date.now()
      setLastSaved(now)
      setLastSavedBackend(now) // Mark as saved to backend
      setIsDirty(false)
      initialDataRef.current = JSON.stringify(data)
      
      // Also save to localStorage to keep them in sync
      localStorage.setItem(key, JSON.stringify(data))
      
      console.log('[AutoSave] Saved to backend at', new Date().toLocaleTimeString())
    } catch (error) {
      console.error('[AutoSave] Failed to save to backend:', error)
      throw error
    } finally {
      setIsSaving(false)
    }
  }
  
  // Restore from localStorage
  const restoreFromLocalStorage = (): T | null => {
    try {
      const saved = localStorage.getItem(key)
      if (saved) {
        const parsed = JSON.parse(saved)
        console.log('[AutoSave] Restored from localStorage')
        return parsed as T
      }
    } catch (error) {
      console.error('[AutoSave] Failed to restore from localStorage:', error)
    }
    return null
  }
  
  // Clear localStorage
  const clearLocalStorage = () => {
    try {
      localStorage.removeItem(key)
      console.log('[AutoSave] Cleared localStorage')
    } catch (error) {
      console.error('[AutoSave] Failed to clear localStorage:', error)
    }
  }
  
  // Force save immediately (bypasses timer)
  const forceSave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    
    try {
      localStorage.setItem(key, JSON.stringify(data))
      setLastSaved(Date.now())
      console.log('[AutoSave] Force saved to localStorage')
    } catch (error) {
      console.error('[AutoSave] Failed to force save:', error)
    }
  }
  
  return {
    lastSaved, // Last time saved to localStorage
    lastSavedBackend, // Last time saved to backend (null if never saved to backend)
    isSaving,
    isDirty,
    saveToBackend,
    restoreFromLocalStorage,
    clearLocalStorage,
    forceSave,
  }
}
