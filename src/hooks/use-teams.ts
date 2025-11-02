import { useKV } from '@github/spark/hooks'
import { Team, UserProfile } from '@/lib/types'
import { toast } from 'sonner'

export function useTeams() {
  const [teams, setTeams] = useKV<Team[]>('teams', [])
  const [profiles] = useKV<UserProfile[]>('user-profiles', [])

  const createTeam = (name: string, description: string, memberIds: string[], createdBy: string) => {
    if (!name.trim()) {
      toast.error('Team name is required')
      return false
    }

    if (memberIds.length === 0) {
      toast.error('At least one member is required')
      return false
    }

    const newTeam: Team = {
      id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      description: description.trim(),
      memberIds,
      createdAt: Date.now(),
      createdBy,
    }

    setTeams((currentTeams) => [...(currentTeams || []), newTeam])
    toast.success(`Team "${name}" created successfully!`)
    return true
  }

  const updateTeam = (teamId: string, updates: Partial<Team>) => {
    setTeams((currentTeams) =>
      (currentTeams || []).map((team) =>
        team.id === teamId ? { ...team, ...updates } : team
      )
    )
    toast.success('Team updated successfully!')
  }

  const deleteTeam = (teamId: string) => {
    const team = (teams || []).find((t) => t.id === teamId)
    if (!team) return

    setTeams((currentTeams) => (currentTeams || []).filter((t) => t.id !== teamId))
    toast.success(`Team "${team.name}" deleted successfully!`)
  }

  const addMembersToTeam = (teamId: string, memberIds: string[]) => {
    setTeams((currentTeams) =>
      (currentTeams || []).map((team) =>
        team.id === teamId
          ? {
              ...team,
              memberIds: [...new Set([...team.memberIds, ...memberIds])],
            }
          : team
      )
    )
    toast.success('Members added to team!')
  }

  const removeMemberFromTeam = (teamId: string, memberId: string) => {
    setTeams((currentTeams) =>
      (currentTeams || []).map((team) =>
        team.id === teamId
          ? {
              ...team,
              memberIds: team.memberIds.filter((id) => id !== memberId),
            }
          : team
      )
    )
    toast.success('Member removed from team!')
  }

  const getTeamByMemberId = (memberId: string): Team | undefined => {
    return (teams || []).find((team) => team.memberIds.includes(memberId))
  }

  const getTeamMembers = (teamId: string): UserProfile[] => {
    const team = (teams || []).find((t) => t.id === teamId)
    if (!team) return []

    return (profiles || []).filter((profile) =>
      team.memberIds.includes(profile.id)
    )
  }

  const getUnassignedMembers = (): UserProfile[] => {
    const assignedMemberIds = new Set(
      (teams || []).flatMap((team) => team.memberIds)
    )
    return (profiles || []).filter(
      (profile) => !assignedMemberIds.has(profile.id)
    )
  }

  return {
    teams: teams || [],
    createTeam,
    updateTeam,
    deleteTeam,
    addMembersToTeam,
    removeMemberFromTeam,
    getTeamByMemberId,
    getTeamMembers,
    getUnassignedMembers,
  }
}
