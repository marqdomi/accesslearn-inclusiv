import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { ForumQuestion, ForumAnswer, UserProfile } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  ChatCircle,
  ThumbsUp,
  CheckCircle,
  ShieldCheck,
  User,
  Plus,
  Question,
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface CourseForumProps {
  courseId: string
  moduleName: string
  currentUserId: string
}

export function CourseForum({ courseId, moduleName, currentUserId }: CourseForumProps) {
  const [questions, setQuestions] = useKV<ForumQuestion[]>('forum-questions', [])
  const [answers, setAnswers] = useKV<ForumAnswer[]>('forum-answers', [])
  const [profiles] = useKV<UserProfile[]>('user-profiles', [])
  const [selectedQuestion, setSelectedQuestion] = useState<ForumQuestion | null>(null)
  const [newQuestionOpen, setNewQuestionOpen] = useState(false)
  const [newAnswerContent, setNewAnswerContent] = useState('')
  const [questionTitle, setQuestionTitle] = useState('')
  const [questionContent, setQuestionContent] = useState('')

  const currentProfile = profiles?.find((p) => p.id === currentUserId)
  const isAdmin = currentProfile?.role === 'admin'

  const moduleQuestions = (questions || [])
    .filter((q) => q.courseId === courseId && q.moduleId === moduleName)
    .sort((a, b) => b.timestamp - a.timestamp)

  const getQuestionAnswers = (questionId: string) => {
    return (answers || [])
      .filter((a) => a.questionId === questionId)
      .sort((a, b) => {
        if (a.isBestAnswer) return -1
        if (b.isBestAnswer) return 1
        return b.upvotes - a.upvotes
      })
  }

  const handleAskQuestion = () => {
    if (!questionTitle.trim() || !questionContent.trim()) {
      toast.error('Please provide both a title and question')
      return
    }

    const newQuestion: ForumQuestion = {
      id: `question-${Date.now()}`,
      courseId,
      moduleId: moduleName,
      userId: currentUserId,
      userName: currentProfile?.displayName || currentProfile?.firstName || 'Anonymous',
      userAvatar: currentProfile?.avatar,
      title: questionTitle.trim(),
      content: questionContent.trim(),
      timestamp: Date.now(),
      upvotes: 0,
      upvotedBy: [],
      answered: false,
    }

    setQuestions((current) => [...(current || []), newQuestion])
    setQuestionTitle('')
    setQuestionContent('')
    setNewQuestionOpen(false)
    toast.success('Question posted successfully!')
  }

  const handleAnswerQuestion = (questionId: string) => {
    if (!newAnswerContent.trim()) {
      toast.error('Please provide an answer')
      return
    }

    const newAnswer: ForumAnswer = {
      id: `answer-${Date.now()}`,
      questionId,
      userId: currentUserId,
      userName: currentProfile?.displayName || currentProfile?.firstName || 'Anonymous',
      userAvatar: currentProfile?.avatar,
      userRole: currentProfile?.role,
      content: newAnswerContent.trim(),
      timestamp: Date.now(),
      upvotes: 0,
      upvotedBy: [],
      isBestAnswer: false,
    }

    setAnswers((current) => [...(current || []), newAnswer])
    setQuestions((current) =>
      (current || []).map((q) =>
        q.id === questionId ? { ...q, answered: true } : q
      )
    )
    setNewAnswerContent('')
    toast.success('Answer posted successfully!')
  }

  const handleUpvoteQuestion = (questionId: string) => {
    setQuestions((current) =>
      (current || []).map((q) => {
        if (q.id !== questionId) return q
        
        const hasUpvoted = q.upvotedBy.includes(currentUserId)
        return {
          ...q,
          upvotes: hasUpvoted ? q.upvotes - 1 : q.upvotes + 1,
          upvotedBy: hasUpvoted
            ? q.upvotedBy.filter((id) => id !== currentUserId)
            : [...q.upvotedBy, currentUserId],
        }
      })
    )
  }

  const handleUpvoteAnswer = (answerId: string) => {
    setAnswers((current) =>
      (current || []).map((a) => {
        if (a.id !== answerId) return a
        
        const hasUpvoted = a.upvotedBy.includes(currentUserId)
        return {
          ...a,
          upvotes: hasUpvoted ? a.upvotes - 1 : a.upvotes + 1,
          upvotedBy: hasUpvoted
            ? a.upvotedBy.filter((id) => id !== currentUserId)
            : [...a.upvotedBy, currentUserId],
        }
      })
    )
  }

  const handleMarkBestAnswer = (questionId: string, answerId: string) => {
    setAnswers((current) =>
      (current || []).map((a) => ({
        ...a,
        isBestAnswer: a.questionId === questionId && a.id === answerId,
      }))
    )
    setQuestions((current) =>
      (current || []).map((q) =>
        q.id === questionId ? { ...q, bestAnswerId: answerId } : q
      )
    )
    toast.success('Marked as best answer!')
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <ChatCircle size={24} weight="fill" className="text-primary" aria-hidden="true" />
                Q&A Forum
              </CardTitle>
              <CardDescription>
                Get help from peers and experts on {moduleName}
              </CardDescription>
            </div>
            <Dialog open={newQuestionOpen} onOpenChange={setNewQuestionOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus size={20} aria-hidden="true" />
                  Ask Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Ask a Question</DialogTitle>
                  <DialogDescription>
                    Ask your peers or instructors about this module
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question-title" className="text-base">
                      Question Title
                    </Label>
                    <Input
                      id="question-title"
                      placeholder="What's your question about?"
                      value={questionTitle}
                      onChange={(e) => setQuestionTitle(e.target.value)}
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="question-content" className="text-base">
                      Details
                    </Label>
                    <Textarea
                      id="question-content"
                      placeholder="Provide more context about your question..."
                      value={questionContent}
                      onChange={(e) => setQuestionContent(e.target.value)}
                      rows={6}
                      className="text-base resize-none"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNewQuestionOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAskQuestion}>Post Question</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            {moduleQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Question size={48} className="text-muted-foreground mb-4" aria-hidden="true" />
                <p className="text-muted-foreground mb-4">
                  No questions yet. Be the first to ask!
                </p>
                <Button onClick={() => setNewQuestionOpen(true)} className="gap-2">
                  <Plus size={20} aria-hidden="true" />
                  Ask the First Question
                </Button>
              </div>
            ) : (
              <div className="space-y-4" role="list" aria-label="Forum questions">
                {moduleQuestions.map((question) => {
                  const questionAnswers = getQuestionAnswers(question.id)
                  const isExpanded = selectedQuestion?.id === question.id

                  return (
                    <Card key={question.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <button
                            className="flex flex-col items-center gap-1 min-w-[3rem]"
                            onClick={() => handleUpvoteQuestion(question.id)}
                            aria-label={`Upvote question (${question.upvotes} votes)`}
                          >
                            <ThumbsUp
                              size={20}
                              weight={question.upvotedBy.includes(currentUserId) ? 'fill' : 'regular'}
                              className={
                                question.upvotedBy.includes(currentUserId)
                                  ? 'text-primary'
                                  : 'text-muted-foreground'
                              }
                              aria-hidden="true"
                            />
                            <span className="text-sm font-medium">{question.upvotes}</span>
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 mb-2">
                              <h3 className="text-base font-semibold flex-1">
                                {question.title}
                              </h3>
                              {question.answered && (
                                <Badge variant="outline" className="gap-1">
                                  <CheckCircle size={14} weight="fill" aria-hidden="true" />
                                  Answered
                                </Badge>
                              )}
                            </div>

                            <p className="text-sm text-muted-foreground mb-3">
                              {question.content}
                            </p>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                              <span className="font-medium">{question.userName}</span>
                              <span>•</span>
                              <span>{formatDistanceToNow(question.timestamp, { addSuffix: true })}</span>
                            </div>

                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0"
                              onClick={() =>
                                setSelectedQuestion(isExpanded ? null : question)
                              }
                              aria-expanded={isExpanded}
                            >
                              {isExpanded ? 'Hide' : 'Show'} {questionAnswers.length}{' '}
                              {questionAnswers.length === 1 ? 'answer' : 'answers'}
                            </Button>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="mt-4 space-y-4"
                                >
                                  <Separator />
                                  
                                  {questionAnswers.map((answer) => (
                                    <div key={answer.id} className="flex items-start gap-3 pl-4 border-l-2 border-muted">
                                      <button
                                        className="flex flex-col items-center gap-1 min-w-[2.5rem]"
                                        onClick={() => handleUpvoteAnswer(answer.id)}
                                        aria-label={`Upvote answer (${answer.upvotes} votes)`}
                                      >
                                        <ThumbsUp
                                          size={16}
                                          weight={answer.upvotedBy.includes(currentUserId) ? 'fill' : 'regular'}
                                          className={
                                            answer.upvotedBy.includes(currentUserId)
                                              ? 'text-primary'
                                              : 'text-muted-foreground'
                                          }
                                          aria-hidden="true"
                                        />
                                        <span className="text-xs font-medium">{answer.upvotes}</span>
                                      </button>

                                      <div className="flex-1 min-w-0">
                                        {answer.isBestAnswer && (
                                          <Badge className="mb-2 gap-1 bg-success text-success-foreground">
                                            <CheckCircle size={14} weight="fill" aria-hidden="true" />
                                            Best Answer
                                          </Badge>
                                        )}

                                        <p className="text-sm mb-2">{answer.content}</p>

                                        <div className="flex items-center justify-between gap-2">
                                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="font-medium flex items-center gap-1">
                                              {answer.userRole === 'admin' && (
                                                <ShieldCheck size={14} weight="fill" className="text-primary" aria-label="Admin" />
                                              )}
                                              {answer.userName}
                                            </span>
                                            <span>•</span>
                                            <span>
                                              {formatDistanceToNow(answer.timestamp, {
                                                addSuffix: true,
                                              })}
                                            </span>
                                          </div>

                                          {(isAdmin || question.userId === currentUserId) &&
                                            !answer.isBestAnswer && (
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-auto p-1 text-xs"
                                                onClick={() =>
                                                  handleMarkBestAnswer(question.id, answer.id)
                                                }
                                              >
                                                Mark as Best Answer
                                              </Button>
                                            )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}

                                  <Separator />

                                  <div className="space-y-2">
                                    <Label htmlFor={`answer-${question.id}`} className="text-sm font-medium">
                                      Your Answer
                                    </Label>
                                    <Textarea
                                      id={`answer-${question.id}`}
                                      placeholder="Share your knowledge..."
                                      value={newAnswerContent}
                                      onChange={(e) => setNewAnswerContent(e.target.value)}
                                      rows={4}
                                      className="text-base resize-none"
                                    />
                                    <Button
                                      onClick={() => handleAnswerQuestion(question.id)}
                                      className="gap-2"
                                    >
                                      Post Answer
                                    </Button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
