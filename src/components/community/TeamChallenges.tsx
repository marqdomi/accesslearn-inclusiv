import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { TeamChallenge, TeamChallengeTeam } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trophy, Users, Lightning, Calendar, Medal } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { formatDistanceToNow, format } from 'date-fns'

interface TeamChallengesProps {
  currentUserId: string
}

export function TeamChallenges({ currentUserId }: TeamChallengesProps) {
  const [challenges] = useKV<TeamChallenge[]>('team-challenges', [])
  const [viewMode, setViewMode] = useState<'visual' | 'table'>('visual')

  const activeChallenges = (challenges || []).filter((c) => c.status === 'active')
  const upcomingChallenges = (challenges || []).filter((c) => c.status === 'upcoming')
  const completedChallenges = (challenges || []).filter((c) => c.status === 'completed')

  const getMetricValue = (team: TeamChallengeTeam, type: string) => {
    switch (type) {
      case 'xp':
        return team.totalXP || 0
      case 'courses':
        return team.totalCoursesCompleted || 0
      case 'modules':
        return team.totalModulesCompleted || 0
      default:
        return 0
    }
  }

  const getMetricLabel = (type: string) => {
    switch (type) {
      case 'xp':
        return 'XP'
      case 'courses':
        return 'Courses'
      case 'modules':
        return 'Modules'
      default:
        return ''
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-[oklch(0.75_0.20_50)] gap-1">
          <Trophy size={14} weight="fill" aria-hidden="true" />
          1st Place
        </Badge>
      case 2:
        return <Badge variant="secondary" className="gap-1">
          <Medal size={14} weight="fill" aria-hidden="true" />
          2nd Place
        </Badge>
      case 3:
        return <Badge variant="outline" className="gap-1">
          <Medal size={14} aria-hidden="true" />
          3rd Place
        </Badge>
      default:
        return <Badge variant="outline">{rank}th</Badge>
    }
  }

  const ChallengeCard = ({ challenge }: { challenge: TeamChallenge }) => {
    const sortedTeams = [...challenge.teams].sort((a, b) => {
      const aValue = getMetricValue(a, challenge.type)
      const bValue = getMetricValue(b, challenge.type)
      return bValue - aValue
    })

    const rankedTeams = sortedTeams.map((team, index) => ({
      ...team,
      rank: index + 1,
    }))

    const maxValue = Math.max(...rankedTeams.map((t) => getMetricValue(t, challenge.type)))

    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 mb-2">
                <Trophy size={24} weight="fill" className="text-accent" aria-hidden="true" />
                {challenge.title}
              </CardTitle>
              <CardDescription>{challenge.description}</CardDescription>
            </div>
            <Badge
              variant={challenge.status === 'active' ? 'default' : 'outline'}
              className="capitalize"
            >
              {challenge.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
            <div className="flex items-center gap-1">
              <Calendar size={16} aria-hidden="true" />
              <span>Ends {formatDistanceToNow(challenge.endDate, { addSuffix: true })}</span>
            </div>
            {challenge.rewards && (
              <div className="flex items-center gap-1">
                <Trophy size={16} aria-hidden="true" />
                <span>{challenge.rewards}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'visual' | 'table')}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Team Leaderboard</h3>
              <TabsList>
                <TabsTrigger value="visual" className="gap-2">
                  <Trophy size={16} aria-hidden="true" />
                  Visual
                </TabsTrigger>
                <TabsTrigger value="table" className="gap-2">
                  <Table className="h-4 w-4" aria-hidden="true" />
                  Table
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="visual" className="mt-0">
              <ScrollArea className="h-[400px]">
                <div className="space-y-4" role="list" aria-label="Team rankings">
                  {rankedTeams.map((team) => {
                    const value = getMetricValue(team, challenge.type)
                    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0

                    return (
                      <motion.div
                        key={team.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 w-8 text-center font-bold text-lg">
                              {team.rank}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{team.name}</h4>
                              {team.department && (
                                <p className="text-xs text-muted-foreground">
                                  {team.department}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="font-bold text-lg">
                                {value.toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {getMetricLabel(challenge.type)}
                              </div>
                            </div>
                            {team.rank <= 3 && getRankBadge(team.rank)}
                          </div>
                        </div>
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-secondary to-accent rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                          />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users size={12} aria-hidden="true" />
                          <span>{team.memberCount} members</span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="table" className="mt-0">
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableCaption>
                    Team rankings for {challenge.title}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Team Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Members</TableHead>
                      <TableHead className="text-right">
                        {getMetricLabel(challenge.type)}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rankedTeams.map((team) => (
                      <TableRow key={team.id}>
                        <TableCell className="font-bold">{team.rank}</TableCell>
                        <TableCell className="font-medium">{team.name}</TableCell>
                        <TableCell>{team.department || 'N/A'}</TableCell>
                        <TableCell className="text-right">{team.memberCount}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {getMetricValue(team, challenge.type).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {activeChallenges.length === 0 && upcomingChallenges.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Trophy size={48} className="text-muted-foreground mb-4" aria-hidden="true" />
            <h3 className="text-lg font-semibold mb-2">No Active Challenges</h3>
            <p className="text-muted-foreground">
              Check back soon for new team challenges!
            </p>
          </CardContent>
        </Card>
      )}

      {activeChallenges.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Lightning size={28} weight="fill" className="text-accent" aria-hidden="true" />
            Active Challenges
          </h2>
          {activeChallenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}

      {upcomingChallenges.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar size={24} aria-hidden="true" />
            Upcoming Challenges
          </h2>
          {upcomingChallenges.map((challenge) => (
            <Card key={challenge.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy size={20} weight="fill" className="text-muted-foreground" aria-hidden="true" />
                  {challenge.title}
                </CardTitle>
                <CardDescription>{challenge.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Starts {format(challenge.startDate, 'PPP')}
                </p>
                {challenge.rewards && (
                  <p className="text-sm font-medium mt-2">
                    Rewards: {challenge.rewards}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
