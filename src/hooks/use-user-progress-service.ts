/**
 * Modern React Hook for User Progress Management
 * 
 * Uses the UserProgressService and UserStatsService instead of direct KV access.
 */

import { useState, useEffect, useCallback } from 'react'
import { UserProgressService, UserStatsService, XPEventService } from '@/services'
import { UserProgress, UserStats, XPEvent } from '@/lib/types'

export interface UseUserProgressResult {
  progress: Record<string, UserProgress>
  stats: UserStats
  recentXPEvents: XPEvent[]
  loading: boolean
  error: Error | null
  
  // Progress operations
  getUserCourseProgress: (courseId: string) => UserProgress | null
  updateProgress: (courseId: string, updates: Partial<UserProgress>) => Promise<void>
  completeModule: (courseId: string, moduleId: string) => Promise<void>
  completeCourse: (courseId: string, score?: number) => Promise<void>
  
  // Stats operations
  addXP: (amount: number, type: XPEvent['type'], label: string) => Promise<void>
  unlockAchievement: (achievementId: string, progress?: number) => Promise<void>
  updateStreak: (currentStreak: number) => Promise<void>
  
  // Refresh
  refresh: () => Promise<void>
}

export function useUserProgress(userId: string): UseUserProgressResult {
  const [progress, setProgress] = useState<Record<string, UserProgress>>({})
  const [stats, setStats] = useState<UserStats | null>(null)
  const [recentXPEvents, setRecentXPEvents] = useState<XPEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load all data on mount
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [progressData, statsData, eventsData] = await Promise.all([
        UserProgressService.getUserProgress(userId),
        UserStatsService.getUserStats(userId),
        XPEventService.getRecentEvents(userId, 10)
      ])
      
      setProgress(progressData)
      setStats(statsData)
      setRecentXPEvents(eventsData)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load user progress'))
      console.error('Error loading user progress:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      loadData()
    }
  }, [userId, loadData])

  // Get progress for a specific course
  const getUserCourseProgress = useCallback((courseId: string): UserProgress | null => {
    return progress[courseId] || null
  }, [progress])

  // Update progress
  const updateProgress = useCallback(async (
    courseId: string,
    updates: Partial<UserProgress>
  ): Promise<void> => {
    try {
      const current = progress[courseId] || {
        courseId,
        status: 'not-started' as const,
        completedModules: [],
        lastAccessed: Date.now(),
        assessmentAttempts: 0
      }

      await UserProgressService.upsertProgress(userId, {
        ...current,
        ...updates
      })

      setProgress(prev => ({
        ...prev,
        [courseId]: { ...current, ...updates }
      }))
    } catch (err) {
      console.error('Error updating progress:', err)
      throw err
    }
  }, [userId, progress])

  // Complete a module
  const completeModule = useCallback(async (
    courseId: string,
    moduleId: string
  ): Promise<void> => {
    try {
      const updated = await UserProgressService.completeModule(userId, courseId, moduleId)
      
      if (updated) {
        const { id, userId: _userId, ...progressData } = updated
        setProgress(prev => ({
          ...prev,
          [courseId]: progressData
        }))
        
        // Update stats
        await UserStatsService.completeModule(userId)
        const newStats = await UserStatsService.getUserStats(userId)
        setStats(newStats)
      }
    } catch (err) {
      console.error('Error completing module:', err)
      throw err
    }
  }, [userId])

  // Complete a course
  const completeCourse = useCallback(async (
    courseId: string,
    score?: number
  ): Promise<void> => {
    try {
      const updated = await UserProgressService.completeCourse(userId, courseId, score)
      
      if (updated) {
        const { id, userId: _userId, ...progressData } = updated
        setProgress(prev => ({
          ...prev,
          [courseId]: progressData
        }))
        
        // Update stats
        await UserStatsService.completeCourse(userId, score)
        const newStats = await UserStatsService.getUserStats(userId)
        setStats(newStats)
      }
    } catch (err) {
      console.error('Error completing course:', err)
      throw err
    }
  }, [userId])

  // Add XP
  const addXP = useCallback(async (
    amount: number,
    type: XPEvent['type'],
    label: string
  ): Promise<void> => {
    try {
      // Update stats
      const newStats = await UserStatsService.addXP(userId, amount)
      setStats(newStats)
      
      // Record event
      await XPEventService.recordEvent(userId, { type, amount, label })
      
      // Refresh recent events
      const events = await XPEventService.getRecentEvents(userId, 10)
      setRecentXPEvents(events)
    } catch (err) {
      console.error('Error adding XP:', err)
      throw err
    }
  }, [userId])

  // Unlock achievement
  const unlockAchievement = useCallback(async (
    achievementId: string,
    progress?: number
  ): Promise<void> => {
    try {
      const newStats = await UserStatsService.unlockAchievement(userId, achievementId, progress)
      setStats(newStats)
    } catch (err) {
      console.error('Error unlocking achievement:', err)
      throw err
    }
  }, [userId])

  // Update streak
  const updateStreak = useCallback(async (currentStreak: number): Promise<void> => {
    try {
      const newStats = await UserStatsService.updateStreak(userId, currentStreak)
      setStats(newStats)
    } catch (err) {
      console.error('Error updating streak:', err)
      throw err
    }
  }, [userId])

  // Refresh all data
  const refresh = useCallback(async () => {
    await loadData()
  }, [loadData])

  return {
    progress,
    stats: stats || {
      totalCoursesCompleted: 0,
      totalModulesCompleted: 0,
      totalAssessmentsPassed: 0,
      averageScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: 0,
      achievementsUnlocked: [],
      totalXP: 0,
      level: 1
    },
    recentXPEvents,
    loading,
    error,
    getUserCourseProgress,
    updateProgress,
    completeModule,
    completeCourse,
    addXP,
    unlockAchievement,
    updateStreak,
    refresh
  }
}
