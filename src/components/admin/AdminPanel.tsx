import { useState } from 'react'
import { AdminDashboard } from './AdminDashboard'
import { CourseManagement } from './CourseManagement'
import { UserManagement } from './UserManagement'
import { GamificationHub } from './GamificationHub'
import { ReportsView } from './ReportsView'
import { BulkEmployeeUpload } from './BulkEmployeeUpload'
import { CorporateReportingDashboard } from './CorporateReportingDashboard'
import { CourseAssignmentManager } from './CourseAssignmentManager'
import { GroupManagement } from './GroupManagement'
import { MentorshipManagement } from './MentorshipManagement'

type AdminSection = 'dashboard' | 'courses' | 'users' | 'gamification' | 'reports' | 'enrollment' | 'corporate-reports' | 'assignments' | 'groups' | 'mentorship'

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
    </div>
  )
}
