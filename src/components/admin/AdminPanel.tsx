import { useState } from 'react'
import { AdminDashboard } from './AdminDashboard'
import { CourseManagement } from './CourseManagement'
import { UserManagement as UserManagementOld } from './UserManagement'
import { UserManagement } from './UserManagementV2'
import { GamificationHub } from './GamificationHub'
import { ReportsView } from './ReportsView'
import { BulkEmployeeUpload } from './BulkEmployeeUpload'
import { ManualEmployeeEnrollment } from './ManualEmployeeEnrollment'
import { CorporateReportingDashboard } from './CorporateReportingDashboard'
import { CourseAssignmentManager } from './CourseAssignmentManager'
import { GroupManagement } from './GroupManagement'
import { MentorshipManagement } from './MentorshipManagement'
import { TeamManagement } from './TeamManagement'
import { AnalyticsDashboard } from './analytics/AnalyticsDashboard'
import { CompanySettings } from './CompanySettings'
import { BrandingManagement } from './BrandingManagement'

type AdminSection = 'dashboard' | 'courses' | 'users' | 'gamification' | 'reports' | 'enrollment' | 'manual-enrollment' | 'corporate-reports' | 'assignments' | 'groups' | 'mentorship' | 'teams' | 'analytics' | 'company-settings' | 'branding'

export function AdminPanel() {
  const [currentSection, setCurrentSection] = useState<AdminSection>('dashboard')

  return (
    <div className="min-h-screen bg-background">
      {currentSection === 'dashboard' && (
        <AdminDashboard onNavigate={setCurrentSection} />
      )}
      {currentSection === 'courses' && (
        <CourseManagement onBack={() => setCurrentSection('dashboard')} />
      )}
      {currentSection === 'users' && (
        <UserManagement onBack={() => setCurrentSection('dashboard')} />
      )}
      {currentSection === 'gamification' && (
        <GamificationHub onBack={() => setCurrentSection('dashboard')} />
      )}
      {currentSection === 'reports' && (
        <ReportsView onBack={() => setCurrentSection('dashboard')} />
      )}
      {currentSection === 'enrollment' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentSection('dashboard')} className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Dashboard
            </button>
          </div>
          <BulkEmployeeUpload />
        </div>
      )}
      {currentSection === 'manual-enrollment' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentSection('dashboard')} className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Dashboard
            </button>
          </div>
          <ManualEmployeeEnrollment />
        </div>
      )}
      {currentSection === 'corporate-reports' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentSection('dashboard')} className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Dashboard
            </button>
          </div>
          <CorporateReportingDashboard />
        </div>
      )}
      {currentSection === 'assignments' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentSection('dashboard')} className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Dashboard
            </button>
          </div>
          <CourseAssignmentManager />
        </div>
      )}
      {currentSection === 'groups' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentSection('dashboard')} className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Dashboard
            </button>
          </div>
          <GroupManagement />
        </div>
      )}
      {currentSection === 'mentorship' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentSection('dashboard')} className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Dashboard
            </button>
          </div>
          <MentorshipManagement />
        </div>
      )}
      {currentSection === 'teams' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentSection('dashboard')} className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Dashboard
            </button>
          </div>
          <TeamManagement />
        </div>
      )}
      {currentSection === 'analytics' && (
        <AnalyticsDashboard onBack={() => setCurrentSection('dashboard')} />
      )}
      {currentSection === 'company-settings' && (
        <CompanySettings onBack={() => setCurrentSection('dashboard')} />
      )}
      {currentSection === 'branding' && (
        <BrandingManagement onBack={() => setCurrentSection('dashboard')} />
      )}
    </div>
  )
}
