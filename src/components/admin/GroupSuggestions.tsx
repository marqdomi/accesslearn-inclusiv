import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { UserGroup, EmployeeCredentials } from '@/lib/types'
import { Sparkle, Check, X, UsersThree } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/lib/i18n'

interface GroupSuggestion {
  name: string
  description: string
  userIds: string[]
  rationale: string
}

export function GroupSuggestions() {
  const { t } = useTranslation()
  const [employees] = useKV<EmployeeCredentials[]>('employee-credentials', [])
  const [groups, setGroups] = useKV<UserGroup[]>('user-groups', [])
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [suggestions, setSuggestions] = useState<GroupSuggestion[]>([])
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set())

  const hasEmployees = (employees || []).length > 0
  const hasSuggestions = suggestions.length > 0

  const generateSuggestions = async () => {
    if (!employees || employees.length === 0) {
      toast.error(t('groupSuggestions.noEmployees', 'Please upload employees first'))
      return
    }

    setIsGenerating(true)
    try {
      const employeeData = (employees || []).map(emp => ({
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        department: emp.department || 'Unassigned'
      }))

      const employeeDataStr = JSON.stringify(employeeData, null, 2)
      
      const isSpanish = t('app.title') === 'GameLearn' && t('nav.dashboard') === 'Panel Principal'
      
      const promptText = isSpanish 
        ? `Eres un asistente de RRHH que ayuda a organizar empleados en grupos lógicos para una plataforma de aprendizaje corporativo.

Analiza los siguientes datos de empleados y sugiere 3-5 grupos de empleados que tengan sentido para asignaciones de cursos y gestión de capacitación.

Datos de Empleados:
${employeeDataStr}

Considera agrupar por:
- Departamento (si está disponible)
- Tamaño del equipo (grupos óptimos de 5-15 personas)
- Patrones de dominio de correo electrónico que puedan indicar equipos o ubicaciones
- Patrones de nombres que puedan sugerir agrupaciones culturales o regionales

Devuelve un objeto JSON con una propiedad "groups" que contenga un array de sugerencias de grupos. Cada sugerencia debe tener:
- name: Un nombre de grupo claro y profesional (en español)
- description: Breve explicación del propósito del grupo (en español)
- userIds: Array de IDs de empleados que pertenecen a este grupo
- rationale: Por qué esta agrupación tiene sentido (1-2 oraciones en español)

Asegúrate de que cada empleado esté asignado a UN SOLO grupo. Prioriza crear grupos equilibrados y significativos.`
        : `You are an HR assistant helping to organize employees into logical groups for a corporate learning platform.

Analyze the following employee data and suggest 3-5 employee groups that would make sense for course assignments and training management.

Employee Data:
${employeeDataStr}

Consider grouping by:
- Department (if available)
- Team size (optimal groups of 5-15 people)
- Email domain patterns that might indicate teams or locations
- Name patterns that might suggest cultural or regional groupings

Return a JSON object with a "groups" property containing an array of group suggestions. Each suggestion should have:
- name: A clear, professional group name
- description: Brief explanation of the group purpose
- userIds: Array of employee IDs that belong to this group
- rationale: Why this grouping makes sense (1-2 sentences)

Make sure each employee is only assigned to ONE group. Prioritize creating balanced, meaningful groups.`

      const response = await window.spark.llm(promptText, 'gpt-4o', true)
      const result = JSON.parse(response)
      
      if (result.groups && Array.isArray(result.groups)) {
        const validEmployeeIds = new Set((employees || []).map(emp => emp.id))
        
        const validatedGroups = result.groups.map(group => ({
          ...group,
          userIds: group.userIds.filter((userId: string) => validEmployeeIds.has(userId))
        })).filter(group => group.userIds.length > 0)
        
        setSuggestions(validatedGroups)
        setSelectedSuggestions(new Set())
        toast.success(`${t('groupSuggestions.generated', 'Generated group suggestions')}: ${validatedGroups.length}`)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error generating suggestions:', error)
      toast.error(t('groupSuggestions.error', 'Failed to generate group suggestions'))
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleSuggestion = (index: number) => {
    setSelectedSuggestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const acceptSelectedSuggestions = () => {
    if (selectedSuggestions.size === 0) {
      toast.error(t('groupSuggestions.selectAtLeastOne', 'Please select at least one group to create'))
      return
    }

    const baseTimestamp = Date.now()
    const newGroups: UserGroup[] = Array.from(selectedSuggestions).map((index, i) => {
      const suggestion = suggestions[index]
      return {
        id: `group_${baseTimestamp}_${i}`,
        name: suggestion.name,
        description: suggestion.description,
        userIds: [...suggestion.userIds],
        courseIds: [],
        createdAt: baseTimestamp + i
      }
    })

    setGroups((current) => [...(current || []), ...newGroups])
    
    const successMessage = newGroups.length > 1 
      ? `${t('groups.createGroup', 'Created')}: ${newGroups.length} ${t('groups.members', 'groups')}`
      : `${t('groups.createGroup', 'Created')}: ${newGroups.length} ${t('groups.groupName', 'group')}`
    
    toast.success(successMessage)
    
    setSuggestions([])
    setSelectedSuggestions(new Set())
  }

  const dismissSuggestions = () => {
    setSuggestions([])
    setSelectedSuggestions(new Set())
  }

  const getUserName = (userId: string) => {
    const employee = employees?.find(e => e.id === userId)
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'
  }

  if (!hasEmployees) {
    return null
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkle size={24} className="text-primary" weight="fill" aria-hidden="true" />
              {t('groupSuggestions.title', 'AI Group Suggestions')}
            </CardTitle>
            <CardDescription>
              {t('groupSuggestions.description', 'Let AI analyze your employees and suggest optimal groups')}
            </CardDescription>
          </div>
          {!hasSuggestions && (
            <Button 
              onClick={generateSuggestions} 
              disabled={isGenerating}
              className="gap-2"
            >
              <Sparkle size={20} weight="fill" aria-hidden="true" />
              {isGenerating 
                ? t('groupSuggestions.generating', 'Generating...') 
                : t('groupSuggestions.generate', 'Generate Suggestions')
              }
            </Button>
          )}
        </div>
      </CardHeader>

      {hasSuggestions && (
        <CardContent className="space-y-4">
          <Alert className="bg-primary/10 border-primary/30">
            <AlertDescription>
              {t('groupSuggestions.reviewMessage', 'Review the suggestions below and select the groups you want to create. You can always create custom groups manually.')}
            </AlertDescription>
          </Alert>

          <AnimatePresence mode="popLayout">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`cursor-pointer transition-all ${
                    selectedSuggestions.has(index) 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-border hover:border-primary/50 hover:shadow-sm'
                  }`}
                  onClick={() => toggleSuggestion(index)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedSuggestions.has(index)}
                        onCheckedChange={() => toggleSuggestion(index)}
                        className="mt-1"
                        aria-label={`Select ${suggestion.name}`}
                      />
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                              <UsersThree size={20} className="text-primary" aria-hidden="true" />
                              {suggestion.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                          </div>
                          <Badge variant="secondary" className="shrink-0">
                            {suggestion.userIds.length} {t('groupSuggestions.members', 'members')}
                          </Badge>
                        </div>

                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm text-foreground">
                            <span className="font-medium">{t('groupSuggestions.rationale', 'Rationale')}: </span>
                            {suggestion.rationale}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                            {t('groupSuggestions.members', 'Members')}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {suggestion.userIds.slice(0, 8).map((userId) => (
                              <Badge key={userId} variant="outline" className="text-xs">
                                {getUserName(userId)}
                              </Badge>
                            ))}
                            {suggestion.userIds.length > 8 && (
                              <Badge variant="outline" className="text-xs">
                                +{suggestion.userIds.length - 8} {t('groups.more', 'more')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          <Separator />

          <div className="flex gap-3 pt-2">
            <Button 
              onClick={acceptSelectedSuggestions}
              disabled={selectedSuggestions.size === 0}
              className="gap-2 flex-1"
            >
              <Check size={20} weight="bold" aria-hidden="true" />
              {t('groupSuggestions.createSelected', 'Create Selected')}: {selectedSuggestions.size}
            </Button>
            <Button 
              variant="outline" 
              onClick={dismissSuggestions}
              className="gap-2"
            >
              <X size={20} aria-hidden="true" />
              {t('groupSuggestions.dismiss', 'Dismiss All')}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
