import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X, Plus } from '@phosphor-icons/react'
import { Course, CourseDifficulty } from '@/services/course-management-service'
import { useState } from 'react'

interface DetailsTabProps {
  course: Partial<Course>
  onChange: (updates: Partial<Course>) => void
  categories: string[]
}

export function DetailsTab({ course, onChange, categories }: DetailsTabProps) {
  const [newTag, setNewTag] = useState('')
  const [newObjective, setNewObjective] = useState('')
  const [newPrerequisite, setNewPrerequisite] = useState('')

  const addTag = () => {
    if (newTag.trim()) {
      const tags = [...(course.tags || []), newTag.trim()]
      onChange({ tags })
      setNewTag('')
    }
  }

  const removeTag = (index: number) => {
    const tags = (course.tags || []).filter((_, i) => i !== index)
    onChange({ tags })
  }

  const addObjective = () => {
    if (newObjective.trim()) {
      const objectives = [...(course.objectives || []), newObjective.trim()]
      onChange({ objectives })
      setNewObjective('')
    }
  }

  const removeObjective = (index: number) => {
    const objectives = (course.objectives || []).filter((_, i) => i !== index)
    onChange({ objectives })
  }

  const addPrerequisite = () => {
    if (newPrerequisite.trim()) {
      const prerequisites = [...(course.prerequisites || []), newPrerequisite.trim()]
      onChange({ prerequisites })
      setNewPrerequisite('')
    }
  }

  const removePrerequisite = (index: number) => {
    const prerequisites = (course.prerequisites || []).filter((_, i) => i !== index)
    onChange({ prerequisites })
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Course Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={course.title || ''}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="e.g., Introduction to Web Development"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={course.description || ''}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Provide a comprehensive description of what students will learn..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={course.category || ''}
                onValueChange={(value) => onChange({ category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                  <SelectItem value="__new__">+ Create New Category</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">
                Difficulty Level <span className="text-red-500">*</span>
              </Label>
              <Select
                value={course.difficulty || ''}
                onValueChange={(value) => onChange({ difficulty: value as CourseDifficulty })}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedHours">Estimated Hours</Label>
            <Input
              id="estimatedHours"
              type="number"
              min="0"
              step="0.5"
              value={course.estimatedHours || 0}
              onChange={(e) => onChange({ estimatedHours: parseFloat(e.target.value) || 0 })}
              placeholder="e.g., 40"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructor">Instructor Name</Label>
            <Input
              id="instructor"
              value={course.instructor || ''}
              onChange={(e) => onChange({ instructor: e.target.value })}
              placeholder="e.g., John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Textarea
              id="targetAudience"
              value={course.targetAudience || ''}
              onChange={(e) => onChange({ targetAudience: e.target.value })}
              placeholder="Describe who this course is designed for..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(course.tags || []).map((tag, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {tag}
                <button
                  onClick={() => removeTag(index)}
                  className="ml-1 hover:text-destructive"
                  aria-label={`Remove tag ${tag}`}
                  title="Remove tag"
                >
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add a tag (e.g., HTML, CSS, JavaScript)"
            />
            <Button type="button" onClick={addTag} variant="outline">
              <Plus size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Objectives</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2">
            {(course.objectives || []).map((objective, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-muted-foreground mt-1">•</span>
                <span className="flex-1">{objective}</span>
                <button
                  onClick={() => removeObjective(index)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Remove objective"
                  title="Remove objective"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Input
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
              placeholder="Add a learning objective"
            />
            <Button type="button" onClick={addObjective} variant="outline">
              <Plus size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prerequisites */}
      <Card>
        <CardHeader>
          <CardTitle>Prerequisites</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2">
            {(course.prerequisites || []).map((prerequisite, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-muted-foreground mt-1">•</span>
                <span className="flex-1">{prerequisite}</span>
                <button
                  onClick={() => removePrerequisite(index)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Remove prerequisite"
                  title="Remove prerequisite"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Input
              value={newPrerequisite}
              onChange={(e) => setNewPrerequisite(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
              placeholder="Add a prerequisite"
            />
            <Button type="button" onClick={addPrerequisite} variant="outline">
              <Plus size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Media (Placeholder for future implementation) */}
      <Card>
        <CardHeader>
          <CardTitle>Course Media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail URL</Label>
            <Input
              id="thumbnail"
              value={course.thumbnail || ''}
              onChange={(e) => onChange({ thumbnail: e.target.value })}
              placeholder="https://example.com/thumbnail.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 1200x630px, JPG or PNG
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner">Banner URL</Label>
            <Input
              id="banner"
              value={course.banner || ''}
              onChange={(e) => onChange({ banner: e.target.value })}
              placeholder="https://example.com/banner.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 1920x400px, JPG or PNG
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
