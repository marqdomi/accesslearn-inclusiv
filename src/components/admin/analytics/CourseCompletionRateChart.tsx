import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useTranslation } from 'react-i18next'

interface CourseCompletionRateChartProps {
  data: Array<{
    courseId: string
    courseTitle: string
    completionRate: number
    enrollments: number
    completions: number
  }>
}

export function CourseCompletionRateChart({ data }: CourseCompletionRateChartProps) {
  const { t } = useTranslation()

  // Truncate course titles for display
  const chartData = data.map(item => ({
    ...item,
    courseTitle: item.courseTitle.length > 30 
      ? item.courseTitle.substring(0, 30) + '...' 
      : item.courseTitle
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {t('analytics.charts.courseCompletionRate', 'Tasa de Finalización por Curso')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={chartData} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              type="number"
              domain={[0, 100]}
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{ 
                value: t('analytics.metrics.completionRate', 'Tasa de Finalización (%)'), 
                position: 'insideBottom', 
                offset: -5,
                style: { fill: 'hsl(var(--muted-foreground))' }
              }}
            />
            <YAxis
              type="category"
              dataKey="courseTitle"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              width={90}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number, name: string, props: any) => {
                if (name === 'completionRate') {
                  return [`${value}%`, t('analytics.metrics.completionRate', 'Tasa de Finalización')]
                }
                return [value, name]
              }}
            />
            <Bar
              dataKey="completionRate"
              name={t('analytics.metrics.completionRate', 'Tasa de Finalización')}
              radius={[0, 8, 8, 0]}
              fill="hsl(var(--primary))"
            >
              {chartData.map((entry, index) => {
                const color = entry.completionRate >= 80 
                  ? 'hsl(var(--success))'
                  : entry.completionRate >= 60
                  ? 'hsl(var(--primary))'
                  : entry.completionRate >= 40
                  ? 'hsl(var(--warning))'
                  : 'hsl(var(--destructive))'
                return <Cell key={`cell-${index}`} fill={color} />
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

