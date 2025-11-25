import { useState, useEffect } from 'react'
import { useWeeklyChallenge } from '@/hooks/use-weekly-challenge'
import { useTranslation } from 'react-i18next'
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
import { Trophy, Users, Lightning, Clock, Medal, ChartBar, ListBullets } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface TeamChallengesProps {
  currentUserId: string
}

export function TeamChallenges({ currentUserId }: TeamChallengesProps) {
  const { t } = useTranslation()
  const { currentChallenge, getUserTeam, getTimeRemaining } = useWeeklyChallenge()
  const [viewMode, setViewMode] = useState<'visual' | 'table'>('visual')
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining())

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining())
    }, 1000)

    return () => clearInterval(interval)
  }, [currentChallenge])

  if (!currentChallenge || !currentChallenge.teamScores || currentChallenge.teamScores.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Trophy size={48} className="text-muted-foreground mb-4" aria-hidden="true" />
          <h3 className="text-lg font-semibold mb-2">
            {t('teamChallenges.noTeams') || 'No Teams Available'}
          </h3>
          <p className="text-muted-foreground">
            {t('teamChallenges.noTeamsDescription') || 'Teams must be created by an administrator to enable challenges.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const userTeam = getUserTeam(currentUserId)
  const sortedTeams = [...currentChallenge.teamScores].sort((a, b) => b.totalXP - a.totalXP)
  const rankedTeams = sortedTeams.map((team, index) => ({
    ...team,
    rank: index + 1,
  }))

  const maxXP = Math.max(...rankedTeams.map(t => t.totalXP))

  const getRankBadge = (rank: number) => {
    const getRankSuffix = (n: number): string => {
      if (n === 1) return t('teamChallenges.rankSuffix.1')
      if (n === 2) return t('teamChallenges.rankSuffix.2')
      if (n === 3) return t('teamChallenges.rankSuffix.3')
      return t('teamChallenges.rankSuffix.default')
    }

    switch (rank) {
      case 1:
        return (
          <Badge className="bg-[oklch(0.75_0.20_50)] text-white gap-1">
            <Trophy size={14} weight="fill" aria-hidden="true" />
            {t('teamChallenges.firstPlace')}
          </Badge>
        )
      case 2:
        return (
          <Badge variant="secondary" className="gap-1">
            <Medal size={14} weight="fill" aria-hidden="true" />
            {t('teamChallenges.secondPlace')}
          </Badge>
        )
      case 3:
        return (
          <Badge variant="outline" className="gap-1">
            <Medal size={14} aria-hidden="true" />
            {t('teamChallenges.thirdPlace')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{rank}{getRankSuffix(rank)}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 mb-2">
                <Trophy size={28} weight="fill" className="text-accent" aria-hidden="true" />
                {t('teamChallenges.title') || 'The Weekly XP Challenge'}
              </CardTitle>
              <CardDescription className="text-base">
                {t('teamChallenges.description') || 'Teams compete to earn the most XP this week. The winning team members get recognition!'}
              </CardDescription>
            </div>
            <Badge variant="default" className="text-base px-4 py-2">
              {t('teamChallenges.active') || 'Active'}
            </Badge>
          </div>
          <div className="flex items-center gap-6 text-sm mt-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Clock size={20} weight="fill" className="text-primary" aria-hidden="true" />
              <span className="font-semibold">
                {t('teamChallenges.timeRemaining') || 'Time Remaining:'}
              </span>
              <span className="text-lg font-bold text-primary">
                {timeRemaining.days}{t('teamChallenges.days')} {timeRemaining.hours}{t('teamChallenges.hours')} {timeRemaining.minutes}{t('teamChallenges.minutes')} {timeRemaining.seconds}{t('teamChallenges.seconds')}
              </span>
            </div>
            {userTeam && (
              <div className="flex items-center gap-2">
                <Users size={20} weight="fill" className="text-secondary" aria-hidden="true" />
                <span className="font-semibold">
                  {t('teamChallenges.yourTeam') || 'Your Team:'}
                </span>
                <Badge variant="secondary" className="text-base px-3">
                  {userTeam.name}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'visual' | 'table')}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lightning size={24} weight="fill" className="text-accent" aria-hidden="true" />
                {t('teamChallenges.leaderboard') || 'Team Leaderboard'}
              </h3>
              <TabsList>
                <TabsTrigger value="visual" className="gap-2">
                  <ChartBar size={16} aria-hidden="true" />
                  {t('teamChallenges.visual') || 'Visual'}
                </TabsTrigger>
                <TabsTrigger value="table" className="gap-2">
                  <ListBullets size={16} aria-hidden="true" />
                  {t('teamChallenges.table') || 'Table'}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="visual" className="mt-0">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4" role="list" aria-label={t('teamChallenges.rankingsLabel') || 'Team rankings'}>
                  {rankedTeams.map((team) => {
                    const percentage = maxXP > 0 ? (team.totalXP / maxXP) * 100 : 0
                    const isUserTeam = userTeam?.id === team.teamId

                    return (
                      <motion.div
                        key={team.teamId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`rounded-lg border-2 p-4 space-y-3 transition-all ${
                          isUserTeam
                            ? 'border-primary bg-primary/10 shadow-md'
                            : 'border-border bg-card'
                        }`}
                        role="listitem"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="flex-shrink-0 w-10 text-center">
                              <div className="text-3xl font-bold text-primary">
                                {team.rank}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-lg truncate flex items-center gap-2">
                                {team.teamName}
                                {isUserTeam && (
                                  <Badge variant="default" className="text-xs">
                                    {t('teamChallenges.yourTeamBadge') || 'Your Team'}
                                  </Badge>
                                )}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Users size={14} aria-hidden="true" />
                                <span>
                                  {team.memberCount} {t('teamChallenges.members') || 'members'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="font-bold text-2xl text-accent">
                                {team.totalXP.toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {t('teamChallenges.xp') || 'XP'}
                              </div>
                            </div>
                            {team.rank <= 3 && getRankBadge(team.rank)}
                          </div>
                        </div>
                        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className={`absolute inset-y-0 left-0 rounded-full ${
                              isUserTeam
                                ? 'bg-gradient-to-r from-primary via-primary to-secondary'
                                : 'bg-gradient-to-r from-secondary via-accent to-accent'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            aria-label={`${percentage.toFixed(0)}% of maximum XP`}
                          />
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="table" className="mt-0">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableCaption>
                    {t('teamChallenges.tableCaption') || 'Team rankings for the Weekly XP Challenge'}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">
                        {t('teamChallenges.rank') || 'Rank'}
                      </TableHead>
                      <TableHead>
                        {t('teamChallenges.teamName') || 'Team Name'}
                      </TableHead>
                      <TableHead className="text-right">
                        {t('teamChallenges.members') || 'Members'}
                      </TableHead>
                      <TableHead className="text-right">
                        {t('teamChallenges.totalXP') || 'Total XP'}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rankedTeams.map((team) => {
                      const isUserTeam = userTeam?.id === team.teamId
                      return (
                        <TableRow
                          key={team.teamId}
                          className={isUserTeam ? 'bg-primary/10 font-semibold' : ''}
                        >
                          <TableCell className="font-bold text-lg">{team.rank}</TableCell>
                          <TableCell className="font-medium">
                            {team.teamName}
                            {isUserTeam && (
                              <Badge variant="default" className="ml-2 text-xs">
                                {t('teamChallenges.yourTeamBadge') || 'Your Team'}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">{team.memberCount}</TableCell>
                          <TableCell className="text-right font-bold text-accent">
                            {team.totalXP.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy size={20} className="text-accent" aria-hidden="true" />
            {t('teamChallenges.rewards') || 'Rewards & Recognition'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>{t('teamChallenges.winnerAnnouncement') || 'Winner Announcement:'}</strong>{' '}
            {t('teamChallenges.winnerDescription') || 'All members of the winning team receive a notification at the end of the week.'}
          </p>
          <p>
            <strong>{t('teamChallenges.profileBadge') || 'Profile Badge:'}</strong>{' '}
            {t('teamChallenges.badgeDescription') || 'Winning team members get a "Weekly Champion" badge for the following week.'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
