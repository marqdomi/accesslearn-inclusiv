import { useState, useEffect } from 'react'
import { Team, UserStats, WeeklyChallengeSnapshot, UserProfile, UserNotification } from '@/lib/types'

export function useWeeklyChallenge() {
  const teams: Team[] = []
  const allStats: Record<string, UserStats> = {}
  const profiles: UserProfile[] = []
  const [currentChallenge, setCurrentChallenge] = useState<WeeklyChallengeSnapshot | null>(null)
  const [challengeHistory, setChallengeHistory] = useState<WeeklyChallengeSnapshot[]>([])
  const [notifications, setNotifications] = useState<UserNotification[]>([])

  const getWeekBounds = (date: Date = new Date()) => {
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(date.setDate(diff))
    monday.setHours(0, 0, 1, 0)
    
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)
    
    return { weekStart: monday.getTime(), weekEnd: sunday.getTime() }
  }

  const generateWeekId = (weekStart: number) => {
    const date = new Date(weekStart)
    return `week-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const calculateTeamXP = (teamId: string, team: Team): number => {
    let totalXP = 0
    team.memberIds.forEach(memberId => {
      const memberStats = allStats?.[memberId]
      if (memberStats) {
        totalXP += memberStats.totalXP || 0
      }
    })
    return totalXP
  }

  const createNewWeeklyChallenge = () => {
    if (!teams || teams.length === 0) return null

    const { weekStart, weekEnd } = getWeekBounds()
    const weekId = generateWeekId(weekStart)

    const teamScores = teams.map(team => ({
      teamId: team.id,
      teamName: team.name,
      totalXP: calculateTeamXP(team.id, team),
      memberCount: team.memberIds.length,
    }))

    const newChallenge: WeeklyChallengeSnapshot = {
      weekId,
      weekStart,
      weekEnd,
      teamScores,
    }

    setCurrentChallenge(newChallenge)
    return newChallenge
  }

  const endCurrentChallenge = () => {
    if (!currentChallenge) return

    const sortedTeams = [...currentChallenge.teamScores].sort((a, b) => b.totalXP - a.totalXP)
    
    if (sortedTeams.length > 0 && sortedTeams[0].totalXP > 0) {
      const winner = sortedTeams[0]
      const completedChallenge: WeeklyChallengeSnapshot = {
        ...currentChallenge,
        winnerId: winner.teamId,
        winnerName: winner.teamName,
      }

      setChallengeHistory((history) => [...(history || []), completedChallenge])

      const winningTeam = (teams || []).find(t => t.id === winner.teamId)
      if (winningTeam) {
        const winningMemberIds = winningTeam.memberIds

        const winnerNotifications: UserNotification[] = winningMemberIds.map(memberId => ({
          id: `notif-${Date.now()}-${memberId}-${Math.random().toString(36).substr(2, 9)}`,
          userId: memberId,
          type: 'team-challenge' as const,
          titleKey: 'weeklyChallenge.winnerTitle',
          messageKey: 'weeklyChallenge.winnerMessage',
          messageParams: {
            teamName: winner.teamName,
            xp: winner.totalXP.toLocaleString()
          },
          timestamp: Date.now(),
          read: false,
        }))

        setNotifications((current) => [...(current || []), ...winnerNotifications])
      }
    }

    createNewWeeklyChallenge()
  }

  useEffect(() => {
    const now = Date.now()

    if (!currentChallenge) {
      createNewWeeklyChallenge()
      return
    }

    if (now > currentChallenge.weekEnd) {
      endCurrentChallenge()
      return
    }

    const updatedScores = (teams || []).map(team => ({
      teamId: team.id,
      teamName: team.name,
      totalXP: calculateTeamXP(team.id, team),
      memberCount: team.memberIds.length,
    }))

    if (JSON.stringify(updatedScores) !== JSON.stringify(currentChallenge.teamScores)) {
      setCurrentChallenge({
        ...currentChallenge,
        teamScores: updatedScores,
      })
    }

    const checkInterval = setInterval(() => {
      const checkNow = Date.now()
      if (checkNow > currentChallenge.weekEnd) {
        endCurrentChallenge()
        clearInterval(checkInterval)
      }
    }, 60000)

    return () => clearInterval(checkInterval)
  }, [teams, allStats, currentChallenge])

  const getTimeRemaining = () => {
    if (!currentChallenge) return { days: 0, hours: 0, minutes: 0, seconds: 0 }

    const now = Date.now()
    const remaining = currentChallenge.weekEnd - now

    if (remaining <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

    return { days, hours, minutes, seconds }
  }

  const getUserTeam = (userId: string): Team | undefined => {
    return (teams || []).find(team => team.memberIds.includes(userId))
  }

  return {
    currentChallenge,
    challengeHistory: challengeHistory || [],
    getTimeRemaining,
    getUserTeam,
  }
}
