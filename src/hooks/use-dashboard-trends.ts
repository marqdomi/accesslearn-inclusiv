/**
 * Hook para calcular tendencias de estadísticas del dashboard
 * Almacena valores previos en localStorage para comparación
 */

import { useState, useEffect } from 'react'

interface DashboardStats {
  totalCourses: number
  enrolledCourses: number
  completedCourses: number
  totalXP: number
  averageProgress: number
}

interface TrendData {
  value: number
  label?: string
}

const STORAGE_KEY = 'dashboard_stats_previous'

export function useDashboardTrends(currentStats: DashboardStats) {
  const [trends, setTrends] = useState<{
    totalCourses: TrendData | null
    enrolledCourses: TrendData | null
    completedCourses: TrendData | null
    totalXP: TrendData | null
    averageProgress: TrendData | null
  }>({
    totalCourses: null,
    enrolledCourses: null,
    completedCourses: null,
    totalXP: null,
    averageProgress: null,
  })

  useEffect(() => {
    // Load previous stats from localStorage
    const previousStatsStr = localStorage.getItem(STORAGE_KEY)
    let previousStats: DashboardStats | null = null

    if (previousStatsStr) {
      try {
        previousStats = JSON.parse(previousStatsStr)
      } catch (e) {
        console.warn('Failed to parse previous stats from localStorage', e)
      }
    }

    // Calculate trends
    const calculateTrend = (
      current: number,
      previous: number | null
    ): TrendData | null => {
      if (previous === null || previous === undefined) {
        return null // No previous data
      }

      if (previous === 0) {
        // If previous was 0 and current is > 0, it's a 100% increase
        return current > 0
          ? { value: 100, label: 'vs. anterior' }
          : null
      }

      const change = ((current - previous) / previous) * 100
      const roundedChange = Math.round(change)

      if (Math.abs(roundedChange) < 1) {
        return null // No significant change
      }

      return {
        value: roundedChange,
        label: 'vs. anterior',
      }
    }

    setTrends({
      totalCourses: calculateTrend(
        currentStats.totalCourses,
        previousStats?.totalCourses ?? null
      ),
      enrolledCourses: calculateTrend(
        currentStats.enrolledCourses,
        previousStats?.enrolledCourses ?? null
      ),
      completedCourses: calculateTrend(
        currentStats.completedCourses,
        previousStats?.completedCourses ?? null
      ),
      totalXP: calculateTrend(
        currentStats.totalXP,
        previousStats?.totalXP ?? null
      ),
      averageProgress: calculateTrend(
        currentStats.averageProgress,
        previousStats?.averageProgress ?? null
      ),
    })

    // Save current stats for next comparison
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentStats))
  }, [currentStats])

  return trends
}

