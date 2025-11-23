import { useState, useMemo } from 'react'
import { Course, ContentModule } from '@/lib/types'
import { useQandA } from '@/hooks/use-qanda'
import { useTranslation } from '@/lib/i18n'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  ThumbsUp,
  ChatCircle,
  MagnifyingGlass,
  Trash,
  CheckCircle,
  ShieldCheck,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

interface QandAForumProps {
  course: Course
  userId: string
  userRole?: 'employee' | 'admin' | 'mentor'
}

type SortOption = 'newest' | 'mostUpvoted' | 'unansweredFirst'

export function QandAForum({ course, userId, userRole }: QandAForumProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const {
    questions,
    loading: qandaLoading,
    postQuestion,
    postAnswer,
    markAsCorrectAnswer,
    upvoteQuestion,
    upvoteAnswer,
    deleteQuestion,
    deleteAnswer,
    getQuestionAnswers,
  } = useQandA(course.id, userId)

  const [showNewQuestionDialog, setShowNewQuestionDialog] = useState(false)
  const [questionTitle, setQuestionTitle] = useState('')
  const [questionContent, setQuestionContent] = useState('')
  const [selectedModule, setSelectedModule] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState<Record<string, string>>({})

  const userName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email?.split('@')[0] || 'User'
  const userAvatar = user?.avatar

  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = questions.filter(q => {
      const matchesSearch =
        searchQuery === '' ||
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.content.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })

    switch (sortBy) {
      case 'mostUpvoted':
        return [...filtered].sort((a, b) => b.upvotes - a.upvotes)
      case 'unansweredFirst':
        return [...filtered].sort((a, b) => {
          if (a.answered === b.answered) return b.timestamp - a.timestamp
          return a.answered ? 1 : -1
        })
      case 'newest':
      default:
        return [...filtered].sort((a, b) => b.timestamp - a.timestamp)
    }
  }, [questions, searchQuery, sortBy])

  const handlePostQuestion = async () => {
    if (!questionTitle.trim() || !questionContent.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    if (!selectedModule) {
      toast.error('Please select a module')
      return
    }

    try {
      await postQuestion(questionTitle, questionContent, selectedModule, userName, userAvatar)
      setQuestionTitle('')
      setQuestionContent('')
      setSelectedModule('')
      setShowNewQuestionDialog(false)
      toast.success(t('qanda.questionPosted'))
    } catch (error) {
      toast.error('Failed to post question')
    }
  }

  const handlePostAnswer = async (questionId: string) => {
    const content = replyContent[questionId]
    if (!content?.trim()) {
      toast.error('Please enter an answer')
      return
    }

    try {
      await postAnswer(questionId, content, userName, userAvatar, userRole)
      setReplyContent(prev => ({ ...prev, [questionId]: '' }))
      toast.success(t('qanda.answerPosted'))
    } catch (error) {
      toast.error('Failed to post answer')
    }
  }

  const handleMarkCorrect = async (answerId: string, questionId: string) => {
    try {
      await markAsCorrectAnswer(answerId, questionId)
      toast.success(t('qanda.markedCorrect'))
    } catch (error) {
      toast.error('Failed to mark as correct')
    }
  }

  const handleUpvoteQuestion = async (questionId: string) => {
    try {
      await upvoteQuestion(questionId)
    } catch (error) {
      toast.error('Failed to upvote question')
    }
  }

  const handleUpvoteAnswer = async (answerId: string) => {
    try {
      await upvoteAnswer(answerId)
    } catch (error) {
      toast.error('Failed to upvote answer')
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await deleteQuestion(questionId)
      toast.success(t('qanda.deleted'))
    } catch (error) {
      toast.error('Failed to delete question')
    }
  }

  const handleDeleteAnswer = async (answerId: string) => {
    try {
      await deleteAnswer(answerId)
      toast.success(t('qanda.deleted'))
    } catch (error) {
      toast.error('Failed to delete answer')
    }
  }

  const canDelete = (itemUserId: string) => {
    return userRole === 'admin' || itemUserId === userId
  }

  const canMarkCorrect = (questionUserId: string) => {
    return userRole === 'admin' || questionUserId === userId
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('qanda.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('qanda.description')}</p>
        </div>
        <Dialog open={showNewQuestionDialog} onOpenChange={setShowNewQuestionDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={20} />
              {t('qanda.postQuestion')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t('qanda.askQuestion')}</DialogTitle>
              <DialogDescription>{t('qanda.description')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label htmlFor="module-select" className="block text-sm font-medium mb-2">
                  {t('qanda.module')}
                </label>
                <Select value={selectedModule} onValueChange={setSelectedModule}>
                  <SelectTrigger id="module-select">
                    <SelectValue placeholder={t('qanda.module')} />
                  </SelectTrigger>
                  <SelectContent>
                    {course.modules.map((module: ContentModule) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="question-title" className="block text-sm font-medium mb-2">
                  {t('qanda.questionTitle')}
                </label>
                <Input
                  id="question-title"
                  value={questionTitle}
                  onChange={e => setQuestionTitle(e.target.value)}
                  placeholder={t('qanda.questionTitlePlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="question-content" className="block text-sm font-medium mb-2">
                  {t('qanda.questionDetails')}
                </label>
                <Textarea
                  id="question-content"
                  value={questionContent}
                  onChange={e => setQuestionContent(e.target.value)}
                  placeholder={t('qanda.questionDetailsPlaceholder')}
                  rows={6}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowNewQuestionDialog(false)}>
                  {t('qanda.cancel')}
                </Button>
                <Button onClick={handlePostQuestion}>{t('qanda.post')}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlass
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('qanda.searchPlaceholder')}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t('qanda.newest')}</SelectItem>
            <SelectItem value="mostUpvoted">{t('qanda.mostUpvoted')}</SelectItem>
            <SelectItem value="unansweredFirst">{t('qanda.unansweredFirst')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {qandaLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {filteredAndSortedQuestions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <ChatCircle size={64} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">{t('qanda.noQuestions')}</h3>
              <p className="text-muted-foreground">{t('qanda.noQuestionsDesc')}</p>
            </motion.div>
          ) : (
          <div className="space-y-4">
            {filteredAndSortedQuestions.map(question => {
              const questionAnswers = getQuestionAnswers(question.id)
              const bestAnswer = questionAnswers.find(a => a.isBestAnswer)
              const otherAnswers = questionAnswers.filter(a => !a.isBestAnswer)
              const isExpanded = expandedQuestion === question.id
              const module = course.modules.find((m: ContentModule) => m.id === question.moduleId)

              return (
                <motion.div
                  key={question.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="p-6">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`gap-1 ${
                            question.upvotedBy.includes(userId) ? 'text-primary' : ''
                          }`}
                          onClick={() => handleUpvoteQuestion(question.id)}
                        >
                          <ThumbsUp
                            size={20}
                            weight={question.upvotedBy.includes(userId) ? 'fill' : 'regular'}
                          />
                          <span className="text-sm">{question.upvotes}</span>
                        </Button>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">{question.title}</h3>
                              {question.answered && (
                                <Badge variant="secondary" className="gap-1">
                                  <CheckCircle size={14} weight="fill" />
                                  {t('qanda.answered')}
                                </Badge>
                              )}
                            </div>
                            {module && (
                              <p className="text-xs text-muted-foreground mb-2">
                                {t('qanda.module')} {module.title}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground mb-3">
                              {question.content}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={question.userAvatar} />
                                  <AvatarFallback>
                                    {question.userName.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{question.userName}</span>
                              </div>
                              <span>•</span>
                              <span>
                                {formatDistanceToNow(question.timestamp, { addSuffix: true })}
                              </span>
                              <span>•</span>
                              <span>
                                {questionAnswers.length} {t('qanda.answers')}
                              </span>
                            </div>
                          </div>
                          {canDelete(question.userId) && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash size={16} />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t('qanda.deleteQuestion')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('qanda.confirmDelete')}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteQuestion(question.id)}
                                  >
                                    {t('common.delete')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setExpandedQuestion(isExpanded ? null : question.id)
                            }
                            className="gap-2"
                          >
                            <ChatCircle size={16} />
                            {isExpanded ? t('common.close') : t('qanda.reply')}
                          </Button>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="space-y-4 overflow-hidden"
                            >
                              {bestAnswer && (
                                <div className="border-l-4 border-success pl-4 py-2 bg-success/5 rounded">
                                  <div className="flex items-start justify-between gap-4 mb-2">
                                    <Badge variant="secondary" className="gap-1">
                                      <CheckCircle size={14} weight="fill" className="text-success" />
                                      {t('qanda.correctAnswer')}
                                    </Badge>
                                  </div>
                                  <p className="text-sm mb-3">{bestAnswer.content}</p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage src={bestAnswer.userAvatar} />
                                          <AvatarFallback>
                                            {bestAnswer.userName.charAt(0).toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span>{bestAnswer.userName}</span>
                                        {bestAnswer.userRole === 'admin' && (
                                          <ShieldCheck size={14} className="text-primary" />
                                        )}
                                      </div>
                                      <span>•</span>
                                      <span>
                                        {formatDistanceToNow(bestAnswer.timestamp, {
                                          addSuffix: true,
                                        })}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`gap-1 ${
                                          bestAnswer.upvotedBy.includes(userId) ? 'text-primary' : ''
                                        }`}
                                        onClick={() => handleUpvoteAnswer(bestAnswer.id)}
                                      >
                                        <ThumbsUp
                                          size={16}
                                          weight={
                                            bestAnswer.upvotedBy.includes(userId) ? 'fill' : 'regular'
                                          }
                                        />
                                        <span className="text-sm">{bestAnswer.upvotes}</span>
                                      </Button>
                                      {canDelete(bestAnswer.userId) && (
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                              <Trash size={14} />
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>
                                                {t('qanda.deleteAnswer')}
                                              </AlertDialogTitle>
                                              <AlertDialogDescription>
                                                {t('qanda.confirmDelete')}
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>
                                                {t('common.cancel')}
                                              </AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={() => handleDeleteAnswer(bestAnswer.id)}
                                              >
                                                {t('common.delete')}
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {otherAnswers.map(answer => (
                                <div key={answer.id} className="pl-4 border-l-2 py-2">
                                  <p className="text-sm mb-3">{answer.content}</p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage src={answer.userAvatar} />
                                          <AvatarFallback>
                                            {answer.userName.charAt(0).toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span>{answer.userName}</span>
                                        {answer.userRole === 'admin' && (
                                          <ShieldCheck size={14} className="text-primary" />
                                        )}
                                      </div>
                                      <span>•</span>
                                      <span>
                                        {formatDistanceToNow(answer.timestamp, { addSuffix: true })}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {canMarkCorrect(question.userId) && !answer.isBestAnswer && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleMarkCorrect(answer.id, question.id)}
                                          className="gap-1 text-xs"
                                        >
                                          <CheckCircle size={14} />
                                          {t('qanda.markAsCorrect')}
                                        </Button>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`gap-1 ${
                                          answer.upvotedBy.includes(userId) ? 'text-primary' : ''
                                        }`}
                                        onClick={() => handleUpvoteAnswer(answer.id)}
                                      >
                                        <ThumbsUp
                                          size={16}
                                          weight={answer.upvotedBy.includes(userId) ? 'fill' : 'regular'}
                                        />
                                        <span className="text-sm">{answer.upvotes}</span>
                                      </Button>
                                      {canDelete(answer.userId) && (
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                              <Trash size={14} />
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>
                                                {t('qanda.deleteAnswer')}
                                              </AlertDialogTitle>
                                              <AlertDialogDescription>
                                                {t('qanda.confirmDelete')}
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>
                                                {t('common.cancel')}
                                              </AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={() => handleDeleteAnswer(answer.id)}
                                              >
                                                {t('common.delete')}
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}

                              <div className="space-y-3">
                                <Textarea
                                  value={replyContent[question.id] || ''}
                                  onChange={e =>
                                    setReplyContent(prev => ({
                                      ...prev,
                                      [question.id]: e.target.value,
                                    }))
                                  }
                                  placeholder={t('qanda.answerPlaceholder')}
                                  rows={4}
                                />
                                <Button
                                  onClick={() => handlePostAnswer(question.id)}
                                  className="gap-2"
                                >
                                  <ChatCircle size={16} />
                                  {t('qanda.postReply')}
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </AnimatePresence>
      )}
    </div>
  )
}
