import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { ApiService } from '@/services/api.service'
import { useTenant } from '@/contexts/TenantContext'
import { DownloadSimple, ChartBar, Table as TableIcon, CheckCircle, XCircle } from '@phosphor-icons/react'
import { useTranslation } from '@/lib/i18n'

export function AssessmentReport() {
  const { t } = useTranslation()
  const { currentTenant } = useTenant()
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<any[]>([])
  const [assessmentReport, setAssessmentReport] = useState<{
    quizId: string
    quizTitle: string
    courseId: string
    courseTitle: string
    totalAttempts: number
    averageScore: number
    passRate: number
    passingScore: number
    questionAnalytics: Array<{
      questionId: string
      questionText: string
      correctAnswerRate: number
      incorrectAnswerRate: number
      totalResponses: number
    }>
  } | null>(null)

  const [selectedQuizId, setSelectedQuizId] = useState<string>('')
  const [viewMode, setViewMode] = useState<'visual' | 'table'>('visual')

  useEffect(() => {
    if (currentTenant) {
      loadCourses()
    }
  }, [currentTenant?.id])

  useEffect(() => {
    if (selectedQuizId && currentTenant) {
      loadAssessmentReport()
    }
  }, [selectedQuizId, currentTenant?.id])

  const loadCourses = async () => {
    if (!currentTenant) return

    try {
      const data = await ApiService.getCourses(currentTenant.id)
      const published = data.filter((c: any) => c.status === 'active')
      setCourses(published)
    } catch (error) {
      console.error('Error loading courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAssessmentReport = async () => {
    if (!currentTenant || !selectedQuizId) return

    try {
      setLoading(true)
      const report = await ApiService.getAssessmentReport(selectedQuizId)
      setAssessmentReport(report)
    } catch (error) {
      console.error('Error loading assessment report:', error)
    } finally {
      setLoading(false)
    }
  }

  // Build quiz options from courses (for frontend compatibility)
  const quizOptions = courses.flatMap((course: any) => {
    const quizzes: any[] = []
    if (course.modules) {
      course.modules.forEach((module: any) => {
        if (module.lessons) {
          module.lessons.forEach((lesson: any) => {
            if (lesson.quiz) {
              quizzes.push({
                quizId: lesson.quiz.id,
                courseTitle: course.title,
                quizTitle: lesson.quiz.title,
                quiz: lesson.quiz
              })
            }
          })
        }
        // Also check if module itself is a quiz
        if (module.type === 'quiz') {
          quizzes.push({
            quizId: module.id,
            courseTitle: course.title,
            quizTitle: module.title,
            quiz: module
          })
        }
      })
    }
    return quizzes
  })

  const exportToCSV = () => {
    if (!assessmentReport) return

    const rows = [
      ['Question', 'Correct Rate %', 'Incorrect Rate %', 'Total Responses'],
      ...assessmentReport.questionAnalytics.map(q => [
        `"${q.questionText.replace(/"/g, '""')}"`,
        q.correctAnswerRate.toString(),
        q.incorrectAnswerRate.toString(),
        q.totalResponses.toString()
      ])
    ]

    const csvContent = rows.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `assessment-report-${assessmentReport.quizTitle}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">{t('analytics.reports.assessment.title')}</h2>
          <p className="text-muted-foreground">{t('analytics.reports.assessment.description')}</p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedQuizId} onValueChange={setSelectedQuizId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder={t('analytics.filters.selectQuiz')} />
            </SelectTrigger>
            <SelectContent>
              {quizOptions.map(quiz => (
                <SelectItem key={quiz.quizId} value={quiz.quizId}>
                  {quiz.courseTitle} - {quiz.quizTitle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedQuizId && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === 'visual' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('visual')}
                  className="gap-2"
                >
                  <ChartBar size={16} />
                  {t('analytics.viewMode.visual')}
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="gap-2"
                >
                  <TableIcon size={16} />
                  {t('analytics.viewMode.table')}
                </Button>
              </div>
              <Button onClick={exportToCSV} className="gap-2">
                <DownloadSimple size={20} />
                {t('analytics.exportCSV')}
              </Button>
            </div>
          )}
        </div>

        {assessmentReport && (
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">{t('analytics.metrics.totalAttempts')}</p>
                    <p className="text-2xl font-bold mt-1">{assessmentReport.totalAttempts}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">{t('analytics.metrics.averageScore')}</p>
                    <p className="text-2xl font-bold mt-1">{assessmentReport.averageScore}%</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">{t('analytics.metrics.passRate')}</p>
                    <p className="text-2xl font-bold mt-1 text-success">{assessmentReport.passRate}%</p>
                  </Card>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">{t('analytics.questionBreakdown')}</h3>
                  
                  {viewMode === 'table' ? (
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('analytics.table.question')}</TableHead>
                            <TableHead>{t('analytics.table.correctRate')}</TableHead>
                            <TableHead>{t('analytics.table.incorrectRate')}</TableHead>
                            <TableHead>{t('analytics.table.totalResponses')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {assessmentReport.questionAnalytics.map((question, index) => (
                            <TableRow key={question.questionId}>
                              <TableCell className="font-medium">
                                {index + 1}. {question.questionText}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Progress value={question.correctAnswerRate} className="w-20" />
                                  <span className="text-success">{question.correctAnswerRate}%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Progress value={question.incorrectAnswerRate} className="w-20" />
                                  <span className="text-destructive">{question.incorrectAnswerRate}%</span>
                                </div>
                              </TableCell>
                              <TableCell>{question.totalResponses}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {assessmentReport.questionAnalytics.map((question, index) => (
                        <Card key={question.questionId} className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold">
                              {index + 1}. {question.questionText}
                            </h4>
                            {question.correctAnswerRate >= 70 ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>{t('analytics.correctRate')}</span>
                              <span className="font-medium">{question.correctAnswerRate}%</span>
                            </div>
                            <Progress value={question.correctAnswerRate} />
                            <div className="flex items-center justify-between text-sm">
                              <span>{t('analytics.incorrectRate')}</span>
                              <span className="font-medium">{question.incorrectAnswerRate}%</span>
                            </div>
                            <Progress value={question.incorrectAnswerRate} className="bg-red-100" />
                            <p className="text-xs text-muted-foreground">
                              {question.totalResponses} {t('analytics.totalResponses')}
                            </p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {!selectedQuizId && !loading && (
          <p className="text-center text-muted-foreground py-8">{t('analytics.selectQuizPrompt')}</p>
        )}
      </div>
    </Card>
  )
}
