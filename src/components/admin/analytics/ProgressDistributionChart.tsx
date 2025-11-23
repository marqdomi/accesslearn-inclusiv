import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useTranslation } from '@/lib/i18n'

interface ProgressDistributionChartProps {
    data: Array<{
        range: string
        count: number
        percentage: number
    }>
}

const COLORS = [
    'hsl(var(--destructive))',   // 0-25%: Red
    'hsl(var(--warning))',        // 26-50%: Orange/Yellow
    'hsl(var(--primary))',        // 51-75%: Blue
    'hsl(var(--success))',        // 76-100%: Green
]

export function ProgressDistributionChart({ data }: ProgressDistributionChartProps) {
    const { t } = useTranslation()

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">
                    {t('analytics.charts.progressDistribution') || 'Progress Distribution'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="range"
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            label={{
                                value: t('analytics.metrics.users') || 'Users',
                                angle: -90,
                                position: 'insideLeft',
                                style: { fill: 'hsl(var(--muted-foreground))' }
                            }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '6px',
                            }}
                            labelStyle={{ color: 'hsl(var(--foreground))' }}
                            formatter={(value: number, name: string, props: any) => [
                                `${value} users (${props.payload.percentage}%)`,
                                t('analytics.metrics.users') || 'Users'
                            ]}
                        />
                        <Bar
                            dataKey="count"
                            radius={[8, 8, 0, 0]}
                            name={t('analytics.metrics.users') || 'Users'}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    {data.map((item, index) => (
                        <div key={item.range} className="flex items-center gap-2">
                            <div
                                className="h-3 w-3 rounded"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-muted-foreground">
                                {item.range}: <span className="font-medium text-foreground">{item.count} ({item.percentage}%)</span>
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
