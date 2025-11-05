import { CourseWithStructure } from '@/services/course-management-service';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  Calendar,
  Trophy,
  Award,
  BarChart3,
  Users,
  Clock,
  Target,
  Plus,
  X,
  Info,
} from 'lucide-react';

interface AdvancedSettingsTabProps {
  course: CourseWithStructure;
  onCourseChange: (updates: Partial<CourseWithStructure>) => void;
}

export function AdvancedSettingsTab({ course, onCourseChange }: AdvancedSettingsTabProps) {
  // Access Control State
  const accessControl = course.advancedSettings?.accessControl || {
    enrollmentType: 'open',
    maxEnrollments: null,
    allowedGroups: [],
    allowedDepartments: [],
    prerequisiteCourses: [],
  };

  // Scheduling State
  const scheduling = course.advancedSettings?.scheduling || {
    startDate: null,
    endDate: null,
    timezone: 'UTC',
    isScheduled: false,
    gracePeriodDays: 0,
    availabilityWindows: [],
  };

  // Gamification State
  const gamification = course.advancedSettings?.gamification || {
    xpMultiplier: 1.0,
    enableLeaderboard: false,
    leaderboardVisibility: 'course',
    customBadges: [],
    bonusRewards: [],
  };

  // Certificates State
  const certificates = course.advancedSettings?.certificates || {
    enabled: false,
    templateId: null,
    autoIssue: true,
    completionCriteria: {
      minScore: 70,
      requiredLessons: 'all',
      requiredQuizzes: 'all',
    },
    customFields: {},
  };

  // Analytics State
  const analytics = course.advancedSettings?.analytics || {
    trackingEnabled: true,
    customEvents: [],
    dataRetentionDays: 365,
    exportFormat: 'csv',
    enableReports: true,
  };

  const updateAccessControl = (updates: Partial<typeof accessControl>) => {
    onCourseChange({
      advancedSettings: {
        ...course.advancedSettings,
        accessControl: { ...accessControl, ...updates },
      },
    });
  };

  const updateScheduling = (updates: Partial<typeof scheduling>) => {
    onCourseChange({
      advancedSettings: {
        ...course.advancedSettings,
        scheduling: { ...scheduling, ...updates },
      },
    });
  };

  const updateGamification = (updates: Partial<typeof gamification>) => {
    onCourseChange({
      advancedSettings: {
        ...course.advancedSettings,
        gamification: { ...gamification, ...updates },
      },
    });
  };

  const updateCertificates = (updates: Partial<typeof certificates>) => {
    onCourseChange({
      advancedSettings: {
        ...course.advancedSettings,
        certificates: { ...certificates, ...updates },
      },
    });
  };

  const updateAnalytics = (updates: Partial<typeof analytics>) => {
    onCourseChange({
      advancedSettings: {
        ...course.advancedSettings,
        analytics: { ...analytics, ...updates },
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Advanced Settings</h2>
        <p className="text-muted-foreground">
          Configure access control, scheduling, gamification, certificates, and analytics for your course.
        </p>
      </div>

      <Accordion type="multiple" className="space-y-4" defaultValue={['access']}>
        {/* Access Control Section */}
        <AccordionItem value="access" className="border rounded-lg">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-blue-500" />
              <div className="text-left">
                <div className="font-semibold">Access Control</div>
                <div className="text-sm text-muted-foreground">
                  Manage enrollment rules, groups, and prerequisites
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pt-4 pb-6">
            <div className="space-y-6">
              {/* Enrollment Type */}
              <div className="space-y-2">
                <Label>Enrollment Type</Label>
                <Select
                  value={accessControl.enrollmentType}
                  onValueChange={(value) => updateAccessControl({ enrollmentType: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                          Open
                        </Badge>
                        <span>Anyone can enroll</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="restricted">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-700 border-orange-500/20">
                          Restricted
                        </Badge>
                        <span>Specific groups/departments only</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="invitation">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-500/20">
                          Invitation
                        </Badge>
                        <span>Invitation only</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Max Enrollments */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Maximum Enrollments</Label>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  type="number"
                  min="0"
                  placeholder="Leave empty for unlimited"
                  value={accessControl.maxEnrollments || ''}
                  onChange={(e) => updateAccessControl({ 
                    maxEnrollments: e.target.value ? parseInt(e.target.value) : null 
                  })}
                />
                <p className="text-sm text-muted-foreground">
                  Set a limit on total enrollments. Leave empty for unlimited.
                </p>
              </div>

              {/* Allowed Groups */}
              {accessControl.enrollmentType === 'restricted' && (
                <div className="space-y-2">
                  <Label>Allowed Groups</Label>
                  <Alert>
                    <Users className="h-4 w-4" />
                    <AlertDescription>
                      Only users in these groups can enroll. Configure groups in the Teams management section.
                    </AlertDescription>
                  </Alert>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[60px]">
                    {accessControl.allowedGroups?.map((group) => (
                      <Badge key={group} variant="secondary" className="gap-1">
                        {group}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive"
                          onClick={() => updateAccessControl({
                            allowedGroups: accessControl.allowedGroups?.filter((g) => g !== group),
                          })}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Group name" id="group-input" />
                    <Button
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById('group-input') as HTMLInputElement;
                        if (input.value.trim()) {
                          updateAccessControl({
                            allowedGroups: [...(accessControl.allowedGroups || []), input.value.trim()],
                          });
                          input.value = '';
                        }
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              )}

              {/* Prerequisites */}
              <div className="space-y-2">
                <Label>Prerequisite Courses</Label>
                <p className="text-sm text-muted-foreground">
                  Users must complete these courses before enrolling in this one.
                </p>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Feature available in future version. Will integrate with course catalog.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Scheduling Section */}
        <AccordionItem value="scheduling" className="border rounded-lg">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div className="text-left">
                <div className="font-semibold">Scheduling</div>
                <div className="text-sm text-muted-foreground">
                  Set course availability dates and timezone
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pt-4 pb-6">
            <div className="space-y-6">
              {/* Self-paced vs Scheduled */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label>Scheduled Course</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable to set specific start and end dates
                  </p>
                </div>
                <Switch
                  checked={scheduling.isScheduled}
                  onCheckedChange={(checked) => updateScheduling({ isScheduled: checked })}
                />
              </div>

              {scheduling.isScheduled && (
                <>
                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="datetime-local"
                      value={scheduling.startDate || ''}
                      onChange={(e) => updateScheduling({ startDate: e.target.value })}
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="datetime-local"
                      value={scheduling.endDate || ''}
                      onChange={(e) => updateScheduling({ endDate: e.target.value })}
                    />
                  </div>

                  {/* Timezone */}
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select
                      value={scheduling.timezone}
                      onValueChange={(value) => updateScheduling({ timezone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (CET/CEST)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                        <SelectItem value="Australia/Sydney">Sydney (AEDT/AEST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Grace Period */}
                  <div className="space-y-2">
                    <Label>Grace Period (Days)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="365"
                      value={scheduling.gracePeriodDays}
                      onChange={(e) => updateScheduling({ gracePeriodDays: parseInt(e.target.value) || 0 })}
                    />
                    <p className="text-sm text-muted-foreground">
                      Allow students to complete the course X days after the end date
                    </p>
                  </div>
                </>
              )}

              {!scheduling.isScheduled && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    This is a self-paced course. Students can start and complete it at any time.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Gamification Section */}
        <AccordionItem value="gamification" className="border rounded-lg">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div className="text-left">
                <div className="font-semibold">Gamification</div>
                <div className="text-sm text-muted-foreground">
                  Configure XP, badges, and leaderboards
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pt-4 pb-6">
            <div className="space-y-6">
              {/* XP Multiplier */}
              <div className="space-y-2">
                <Label>XP Multiplier</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={gamification.xpMultiplier}
                    onChange={(e) => updateGamification({ xpMultiplier: parseFloat(e.target.value) || 1.0 })}
                    className="w-32"
                  />
                  <Badge variant="outline">
                    {gamification.xpMultiplier}x XP
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Multiply all XP rewards in this course by this factor
                </p>
              </div>

              {/* Leaderboard */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label>Enable Leaderboard</Label>
                  <p className="text-sm text-muted-foreground">
                    Show course ranking and competition
                  </p>
                </div>
                <Switch
                  checked={gamification.enableLeaderboard}
                  onCheckedChange={(checked) => updateGamification({ enableLeaderboard: checked })}
                />
              </div>

              {gamification.enableLeaderboard && (
                <div className="space-y-2">
                  <Label>Leaderboard Visibility</Label>
                  <Select
                    value={gamification.leaderboardVisibility}
                    onValueChange={(value) => updateGamification({ leaderboardVisibility: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="course">Course Only - Students see only this course ranking</SelectItem>
                      <SelectItem value="global">Global - Include in platform-wide leaderboard</SelectItem>
                      <SelectItem value="team">Team Only - Only team members see each other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Custom Badges */}
              <div className="space-y-2">
                <Label>Custom Course Badges</Label>
                <Alert>
                  <Award className="h-4 w-4" />
                  <AlertDescription>
                    Custom badges can be configured to unlock at specific milestones. Feature coming in future version.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Certificates Section */}
        <AccordionItem value="certificates" className="border rounded-lg">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-green-500" />
              <div className="text-left">
                <div className="font-semibold">Certificates</div>
                <div className="text-sm text-muted-foreground">
                  Configure course completion certificates
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pt-4 pb-6">
            <div className="space-y-6">
              {/* Enable Certificates */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label>Enable Certificates</Label>
                  <p className="text-sm text-muted-foreground">
                    Award certificates upon course completion
                  </p>
                </div>
                <Switch
                  checked={certificates.enabled}
                  onCheckedChange={(checked) => updateCertificates({ enabled: checked })}
                />
              </div>

              {certificates.enabled && (
                <>
                  {/* Auto Issue */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label>Auto-Issue Certificates</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically generate when criteria are met
                      </p>
                    </div>
                    <Switch
                      checked={certificates.autoIssue}
                      onCheckedChange={(checked) => updateCertificates({ autoIssue: checked })}
                    />
                  </div>

                  {/* Completion Criteria */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Completion Criteria</CardTitle>
                      <CardDescription>Set requirements for certificate eligibility</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Minimum Score (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={certificates.completionCriteria.minScore}
                          onChange={(e) => updateCertificates({
                            completionCriteria: {
                              ...certificates.completionCriteria,
                              minScore: parseInt(e.target.value) || 70,
                            },
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Required Lessons</Label>
                        <Select
                          value={certificates.completionCriteria.requiredLessons}
                          onValueChange={(value) => updateCertificates({
                            completionCriteria: {
                              ...certificates.completionCriteria,
                              requiredLessons: value as any,
                            },
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Lessons</SelectItem>
                            <SelectItem value="required">Required Lessons Only</SelectItem>
                            <SelectItem value="percentage">Percentage Threshold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Required Quizzes</Label>
                        <Select
                          value={certificates.completionCriteria.requiredQuizzes}
                          onValueChange={(value) => updateCertificates({
                            completionCriteria: {
                              ...certificates.completionCriteria,
                              requiredQuizzes: value as any,
                            },
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Quizzes</SelectItem>
                            <SelectItem value="required">Required Quizzes Only</SelectItem>
                            <SelectItem value="passing">Pass with Minimum Score</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Template */}
                  <div className="space-y-2">
                    <Label>Certificate Template</Label>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Certificate templates can be customized in the Certificates management section.
                      </AlertDescription>
                    </Alert>
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Analytics Section */}
        <AccordionItem value="analytics" className="border rounded-lg">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              <div className="text-left">
                <div className="font-semibold">Analytics & Reporting</div>
                <div className="text-sm text-muted-foreground">
                  Configure tracking and data collection
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pt-4 pb-6">
            <div className="space-y-6">
              {/* Enable Tracking */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label>Enable Analytics Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Collect detailed usage data and metrics
                  </p>
                </div>
                <Switch
                  checked={analytics.trackingEnabled}
                  onCheckedChange={(checked) => updateAnalytics({ trackingEnabled: checked })}
                />
              </div>

              {analytics.trackingEnabled && (
                <>
                  {/* Enable Reports */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label>Enable Reporting Dashboard</Label>
                      <p className="text-sm text-muted-foreground">
                        Show analytics dashboard to instructors
                      </p>
                    </div>
                    <Switch
                      checked={analytics.enableReports}
                      onCheckedChange={(checked) => updateAnalytics({ enableReports: checked })}
                    />
                  </div>

                  {/* Data Retention */}
                  <div className="space-y-2">
                    <Label>Data Retention (Days)</Label>
                    <Input
                      type="number"
                      min="30"
                      max="3650"
                      value={analytics.dataRetentionDays}
                      onChange={(e) => updateAnalytics({ dataRetentionDays: parseInt(e.target.value) || 365 })}
                    />
                    <p className="text-sm text-muted-foreground">
                      How long to keep detailed analytics data (30-3650 days)
                    </p>
                  </div>

                  {/* Export Format */}
                  <div className="space-y-2">
                    <Label>Export Format</Label>
                    <Select
                      value={analytics.exportFormat}
                      onValueChange={(value) => updateAnalytics({ exportFormat: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV (Comma Separated)</SelectItem>
                        <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="pdf">PDF Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Custom Events */}
                  <div className="space-y-2">
                    <Label>Custom Events</Label>
                    <Alert>
                      <Target className="h-4 w-4" />
                      <AlertDescription>
                        Configure custom tracking events for specific actions. Feature available in advanced analytics module.
                      </AlertDescription>
                    </Alert>
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Advanced settings are optional. Default values will be used if not configured.
          Some features are in preview and will be fully functional in future releases.
        </AlertDescription>
      </Alert>
    </div>
  );
}
