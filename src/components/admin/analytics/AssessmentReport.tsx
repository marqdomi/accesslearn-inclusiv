import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { useKV } from '@github/spark/hooks'
import { CourseStructure, QuizAttempt, Quiz } from '@/lib/types'
import { DownloadSimple, ChartBar, Table as TableIcon, CheckCircle, XCircle } from '@phosphor-icons/react'
import { useTranslation } from '@/lib/i18n'

export function AssessmentReport() {
  const { t } = useTranslation()
  const [courses] = useKV<CourseStructure[]>('courses', [])
  const [quizAttempts] = useKV<QuizAttempt[]>('quiz-attempts', [])

  const [selectedQuizId, setSelectedQuizId] = useState<string>('')
  const [viewMode, setViewMode] = useState<'visual' | 'table'>('visual')

  const publishedCourses = (courses || []).filter(c => c.published)
  
  const quizOptions = publishedCourses.flatMap(course =>
    (course.modules || []).flatMap(module =>
      (module.lessons || []).flatMap(lesson =>
        lesson.quiz ? [{
          quizId: lesson.quiz.id,
          courseTitle: course.title,
          quizTitle: lesson.quiz.title,
          quiz: lesson.quiz
        }] : []
      )
    )
  )

  const selectedQuizData = quizOptions.find(q => q.quizId === selectedQuizId)
  const quizAttemptsForSelected = (quizAttempts || []).filter(a => a.quizId === selectedQuizId)

  const exportToCSV = () => {
    if (!selectedQuizData) return

    const questionAnalytics = selectedQuizData.quiz.questions.map(question => {
      const responses = quizAttemptsForSelected.flatMap(attempt =>
        attempt.answers.filter(a => a.questionId === question.id)
      )
      const correctCount = responses.filter(r => r.correct).length
      const incorrectCount = responses.length - correctCount

      return {
        question: question.question,
        correctRate: responses.length > 0 ? Math.round((correctCount / responses.length) * 100) : 0,
        incorrectRate: responses.length > 0 ? Math.round((incorrectCount / responses.length) * 100) : 0,
        totalResponses: responses.length
      }
    })

    const rows = [
      ['Question', 'Correct Rate %', 'Incorrect Rate %', 'Total Responses'],
      ...questionAnalytics.map(q => [
        `"${q.question.replace(/"/g, '""')}"`,
        q.correctRate.toString(),
        q.incorrectRate.toString(),
        q.totalResponses.toString()
      ])
    ]

    const csvContent = rows.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `assessment-report-${selectedQuizData.quizTitle}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const assessmentStats = selectedQuizData ? (() => {
    const scores = quizAttemptsForSelected.map(a => a.score)
    const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    const passRate = scores.length > 0 ? Math.round((scores.filter(s => s >= (selectedQuizData.quiz.passingScore || 70)).length / scores.length) * 100) : 0

    return {
      totalAttempts: quizAttemptsForSelected.length,
      averageScore,
      passRate
    }
  })() : null

  const questionAnalytics = selectedQuizData ? selectedQuizData.quiz.questions.map(question => {
    const responses = quizAttemptsForSelected.flatMap(attempt =>
      attempt.answers.filter(a => a.questionId === question.id)
    )
    const correctCount = responses.filter(r => r.correct).length
    const totalResponses = responses.length

    return {
      questionId: question.id,
      questionText: question.question,
      correctAnswerRate: totalResponses > 0 ? Math.round((correctCount / totalResponses) * 100) : 0,
      incorrectAnswerRate: totalResponses > 0 ? Math.round(((totalResponses - correctCount) / totalResponses) * 100) : 0,
      totalResponses
    }
  }) : []

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

        {selectedQuizData && assessmentStats && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">{t('analytics.totalAttempts')}</p>
                <p className="text-2xl font-bold mt-1">{assessmentStats.totalAttempts}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">{t('analytics.averageScore')}</p>
                <p className="text-2xl font-bold mt-1">{assessmentStats.averageScore}%</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">{t('analytics.passRate')}</p>
                <p className="text-2xl font-bold mt-1 text-success">{assessmentStats.passRate}%</p>
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
                        <TableHead>{t('analytics.table.responses')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questionAnalytics.map((question, index) => (
                        <TableRow key={question.questionId}>
                          <TableCell className="font-medium">
                            {index + 1}. {question.questionText}
                          </TableCell>
                          <TableCell className="text-success">{question.correctAnswerRate}%</TableCell>
                          <TableCell className="text-destructive">{question.incorrectAnswerRate}%</TableCell>
                          <TableCell>{question.totalResponses}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="space-y-4">
                  {questionAnalytics.map((question, index) => (
                    <div key={question.questionId} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">
                        {index + 1}. {question.questionText}
                      </h4>

                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="flex items-center gap-2">
                              <CheckCircle size={16} className="text-success" />
                              {t('analytics.correctAnswers')}
                            </span>
                            <span className="font-medium text-success">{question.correctAnswerRate}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-success transition-all"
                              style={{ width: `${question.correctAnswerRate}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="flex items-center gap-2">
                              <XCircle size={16} className="text-destructive" />
                              {t('analytics.incorrectAnswers')}
                            </span>
                            <span className="font-medium text-destructive">{question.incorrectAnswerRate}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-destructive transition-all"
                              style={{ width: `${question.incorrectAnswerRate}%` }}
                            />
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          {question.totalResponses} {t('analytics.totalResponses')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {!selectedQuizId && (
          <p className="text-center text-muted-foreground py-8">{t('analytics.selectQuizPrompt')}</p>
        )}
      </div>
    </Card>
  )
}
