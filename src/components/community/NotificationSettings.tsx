import { useKV } from '@github/spark/hooks'
import { NotificationPreferences } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Bell, BellSlash, Envelope, Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface NotificationSettingsProps {
  userId: string
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  activityFeed: true,
  forumReplies: true,
  achievements: true,
  teamChallenges: true,
  courseReminders: true,
  emailSummary: 'weekly',
  soundEffects: false,
  inAppBadges: true,
}

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useKV<Record<string, NotificationPreferences>>(
    'notification-preferences',
    {}
  )

  const userPrefs = preferences?.[userId] || DEFAULT_PREFERENCES

  const updatePreference = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    setPreferences((current) => ({
      ...(current || {}),
      [userId]: {
        ...(current?.[userId] || DEFAULT_PREFERENCES),
        [key]: value,
      },
    }))
    toast.success('Notification preferences updated')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell size={24} weight="fill" className="text-primary" aria-hidden="true" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Customize how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">In-App Notifications</h3>
          
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="activity-feed" className="text-base cursor-pointer">
                Activity Feed Updates
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when teammates reach milestones
              </p>
            </div>
            <Switch
              id="activity-feed"
              checked={userPrefs.activityFeed}
              onCheckedChange={(checked) => updatePreference('activityFeed', checked)}
              aria-label="Toggle activity feed notifications"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="forum-replies" className="text-base cursor-pointer">
                Forum Replies
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive alerts when someone answers your questions
              </p>
            </div>
            <Switch
              id="forum-replies"
              checked={userPrefs.forumReplies}
              onCheckedChange={(checked) => updatePreference('forumReplies', checked)}
              aria-label="Toggle forum reply notifications"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="achievements" className="text-base cursor-pointer">
                Achievements & Badges
              </Label>
              <p className="text-sm text-muted-foreground">
                Celebrate when you earn new achievements
              </p>
            </div>
            <Switch
              id="achievements"
              checked={userPrefs.achievements}
              onCheckedChange={(checked) => updatePreference('achievements', checked)}
              aria-label="Toggle achievement notifications"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="team-challenges" className="text-base cursor-pointer">
                Team Challenge Updates
              </Label>
              <p className="text-sm text-muted-foreground">
                Stay informed about team competition progress
              </p>
            </div>
            <Switch
              id="team-challenges"
              checked={userPrefs.teamChallenges}
              onCheckedChange={(checked) => updatePreference('teamChallenges', checked)}
              aria-label="Toggle team challenge notifications"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="course-reminders" className="text-base cursor-pointer">
                Course Reminders
              </Label>
              <p className="text-sm text-muted-foreground">
                Gentle reminders to continue your learning journey
              </p>
            </div>
            <Switch
              id="course-reminders"
              checked={userPrefs.courseReminders}
              onCheckedChange={(checked) => updatePreference('courseReminders', checked)}
              aria-label="Toggle course reminder notifications"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="in-app-badges" className="text-base cursor-pointer">
                Notification Badges
              </Label>
              <p className="text-sm text-muted-foreground">
                Show visual badge indicators for new notifications
              </p>
            </div>
            <Switch
              id="in-app-badges"
              checked={userPrefs.inAppBadges}
              onCheckedChange={(checked) => updatePreference('inAppBadges', checked)}
              aria-label="Toggle notification badges"
            />
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Envelope size={18} aria-hidden="true" />
            Email Notifications
          </h3>
          
          <div className="space-y-3">
            <Label className="text-base">Email Summary Frequency</Label>
            <RadioGroup
              value={userPrefs.emailSummary}
              onValueChange={(value) =>
                updatePreference('emailSummary', value as 'never' | 'daily' | 'weekly')
              }
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="never" id="email-never" />
                <Label htmlFor="email-never" className="cursor-pointer font-normal">
                  Never send email summaries
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="daily" id="email-daily" />
                <Label htmlFor="email-daily" className="cursor-pointer font-normal">
                  Daily summary (delivered each morning)
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="weekly" id="email-weekly" />
                <Label htmlFor="email-weekly" className="cursor-pointer font-normal">
                  Weekly summary (delivered Monday mornings)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Sparkle size={18} aria-hidden="true" />
            Accessibility & Sensory
          </h3>
          
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="sound-effects" className="text-base cursor-pointer">
                Sound Effects
              </Label>
              <p className="text-sm text-muted-foreground">
                Play sounds for notifications (recommended to keep disabled for focus)
              </p>
            </div>
            <Switch
              id="sound-effects"
              checked={userPrefs.soundEffects}
              onCheckedChange={(checked) => updatePreference('soundEffects', checked)}
              aria-label="Toggle sound effects"
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Note:</strong> All notifications are designed to be
            calm and non-intrusive. You have full control over what you receive and when.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
