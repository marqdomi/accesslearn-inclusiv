import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { UserProfile, ActivityMention } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface UserMentionInputProps {
  users: UserProfile[]
  currentUserId: string
  onSubmit: (content: string, mentions: ActivityMention[]) => void
  placeholder?: string
  buttonText?: string
}

export function UserMentionInput({
  users,
  currentUserId,
  onSubmit,
  placeholder = 'Add a comment...',
  buttonText = 'Post',
}: UserMentionInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [mentionStartIndex, setMentionStartIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  const availableUsers = users.filter((u) => u.id !== currentUserId)

  useEffect(() => {
    const beforeCursor = inputValue.slice(0, cursorPosition)
    const atIndex = beforeCursor.lastIndexOf('@')

    if (atIndex !== -1) {
      const afterAt = beforeCursor.slice(atIndex + 1)
      const hasSpace = afterAt.includes(' ')

      if (!hasSpace) {
        const searchTerm = afterAt.toLowerCase()
        const matches = availableUsers.filter((user) => {
          const displayName = user.displayName || `${user.firstName} ${user.lastName}`
          return displayName.toLowerCase().includes(searchTerm)
        })

        if (matches.length > 0) {
          setFilteredUsers(matches)
          setShowSuggestions(true)
          setMentionStartIndex(atIndex)
          setSelectedIndex(0)
          return
        }
      }
    }

    setShowSuggestions(false)
    setMentionStartIndex(-1)
  }, [inputValue, cursorPosition, availableUsers])

  const insertMention = (user: UserProfile) => {
    if (mentionStartIndex === -1) return

    const displayName = user.displayName || `${user.firstName} ${user.lastName}`
    const before = inputValue.slice(0, mentionStartIndex)
    const after = inputValue.slice(cursorPosition)
    const newValue = `${before}@${displayName} ${after}`

    setInputValue(newValue)
    setShowSuggestions(false)
    setMentionStartIndex(-1)

    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPos = mentionStartIndex + displayName.length + 2
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos)
        inputRef.current.focus()
      }
    }, 0)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % filteredUsers.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length)
    } else if (e.key === 'Enter' && filteredUsers.length > 0) {
      e.preventDefault()
      insertMention(filteredUsers[selectedIndex])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setShowSuggestions(false)
    }
  }

  const handleSubmit = () => {
    if (!inputValue.trim()) return

    const mentions: ActivityMention[] = []
    const mentionRegex = /@(\S+(?:\s+\S+)*?)(?=\s|$)/g
    let match

    while ((match = mentionRegex.exec(inputValue)) !== null) {
      const mentionText = match[1]
      const user = availableUsers.find((u) => {
        const displayName = u.displayName || `${u.firstName} ${u.lastName}`
        return displayName === mentionText
      })

      if (user) {
        mentions.push({
          userId: user.id,
          userName: user.displayName || `${user.firstName} ${user.lastName}`,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        })
      }
    }

    onSubmit(inputValue, mentions)
    setInputValue('')
    setCursorPosition(0)
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setCursorPosition(e.target.selectionStart || 0)
          }}
          onKeyDown={(e) => {
            handleKeyDown(e)
            if (e.key === 'Enter' && !showSuggestions) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          onSelect={(e) => {
            const target = e.target as HTMLInputElement
            setCursorPosition(target.selectionStart || 0)
          }}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button onClick={handleSubmit} disabled={!inputValue.trim()}>
          {buttonText}
        </Button>
      </div>

      {showSuggestions && filteredUsers.length > 0 && (
        <Card className="absolute z-50 mt-1 w-full max-w-sm p-2">
          <ScrollArea className="max-h-60">
            <div className="space-y-1">
              {filteredUsers.map((user, index) => {
                const displayName = user.displayName || `${user.firstName} ${user.lastName}`
                return (
                  <button
                    key={user.id}
                    onClick={() => insertMention(user)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-md transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      index === selectedIndex && 'bg-accent text-accent-foreground'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                        {user.avatar || displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  )
}
