import { useState } from 'react'
import { AdminDashboard } from './AdminDashboard'
import { CourseManagement } from './CourseManagement'
import { UserManagement } from './UserManagement'
import { GamificationHub } from './GamificationHub'
import { ReportsView } from './ReportsView'

type AdminSection = 'dashboard' | 'courses' | 'users' | 'gamification' | 'reports'

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
    </div>
  )
}
