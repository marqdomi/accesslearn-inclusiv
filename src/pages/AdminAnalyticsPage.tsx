import { AnalyticsDashboard } from '@/components/admin/analytics/AnalyticsDashboard'

export function AdminAnalyticsPage() {
    return <AnalyticsDashboard onBack={() => window.history.back()} />
}
