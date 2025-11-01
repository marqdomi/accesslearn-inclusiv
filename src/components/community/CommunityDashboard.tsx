import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ActivityFeed } from '@/components/community/ActivityFeed'
import { TeamChallenges } from '@/components/community/TeamChallenges'
import { NotificationSettings } from '@/components/community/NotificationSettings'
import { Sparkle, Trophy, Bell, Users } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface CommunityDashboardProps {
  currentUserId: string
}

export function CommunityDashboard({ currentUserId }: CommunityDashboardProps) {
  const [activeTab, setActiveTab] = useState('activity')

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users size={36} weight="fill" className="text-primary" aria-hidden="true" />
          Community
        </h1>
        <p className="text-muted-foreground mt-2">
          Connect with your teammates, celebrate achievements, and compete in challenges
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="activity" className="gap-2">
            <Sparkle size={20} aria-hidden="true" />
            <span className="hidden sm:inline">Activity Feed</span>
            <span className="sm:hidden">Activity</span>
          </TabsTrigger>
          <TabsTrigger value="challenges" className="gap-2">
            <Trophy size={20} aria-hidden="true" />
            <span className="hidden sm:inline">Team Challenges</span>
            <span className="sm:hidden">Challenges</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell size={20} aria-hidden="true" />
            <span className="hidden sm:inline">Notifications</span>
            <span className="sm:hidden">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <ActivityFeed currentUserId={currentUserId} />
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <TeamChallenges currentUserId={currentUserId} />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettings userId={currentUserId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
