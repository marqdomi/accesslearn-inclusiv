import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useTranslation } from '@/lib/i18n'

interface EngagementTrendChartProps {
    data: Array<{
        week: string
        xpGained: number
        activeUsers: number
    }>
}

export function EngagementTrendChart({ data }: EngagementTrendChartProps) {
    const { t } = useTranslation()

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">
                    {t('analytics.charts.engagementTrend') || 'Engagement Trend'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="week"
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '6px',
                            }}
                            labelStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Legend
                            wrapperStyle={{
                                paddingTop: '20px',
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="xpGained"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            name={t('analytics.metrics.xpGained') || 'XP Gained'}
                            dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="activeUsers"
                            stroke="hsl(var(--secondary))"
                            strokeWidth={2}
                            name={t('analytics.metrics.activeUsers') || 'Active Users'}
                            dot={{ fill: 'hsl(var(--secondary))', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
