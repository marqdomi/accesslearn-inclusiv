import { Quiz } from '@/lib/types'

interface QuizBuilderProps {
  quiz?: Quiz
  onSave: (quiz: Quiz) => void
  onCancel: () => void
}

export function QuizBuilder({ quiz, onSave, onCancel }: QuizBuilderProps) {
  return (
    <div>
      Quiz Builder - Coming Soon
    </div>
  )
}
