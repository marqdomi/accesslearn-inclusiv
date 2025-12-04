import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useTranslation } from 'react-i18next'

interface ScoreDistributionChartProps {
  data: Array<{
    range: string
    count: number
    percentage: number
  }>
}

const SCORE_COLORS = [
  'hsl(var(--destructive))',   // 0-50%: Red
  'hsl(var(--destructive))',   // 51-60%: Red-Orange
  'hsl(var(--warning))',        // 61-70%: Orange/Yellow
  'hsl(var(--primary))',        // 71-80%: Blue
  'hsl(var(--success))',        // 81-90%: Green
  'hsl(var(--success))',        // 91-100%: Dark Green
]

export function ScoreDistributionChart({ data }: ScoreDistributionChartProps) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {t('analytics.charts.scoreDistribution', 'Distribución de Puntuaciones')}
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
                value: t('analytics.metrics.attempts', 'Intentos'),
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
                `${value} ${t('analytics.metrics.attempts', 'intentos')} (${props.payload.percentage}%)`,
                t('analytics.metrics.attempts', 'Intentos')
              ]}
            />
            <Bar
              dataKey="count"
              radius={[8, 8, 0, 0]}
              name={t('analytics.metrics.attempts', 'Intentos')}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={SCORE_COLORS[index % SCORE_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {data.map((item, index) => (
            <div key={item.range} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded"
                style={{ backgroundColor: SCORE_COLORS[index % SCORE_COLORS.length] }}
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

