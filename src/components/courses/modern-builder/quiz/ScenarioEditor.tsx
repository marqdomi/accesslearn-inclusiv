import { ScenarioQuestion, ScenarioStep, ScenarioOption } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash, Info, FlowArrow, Target } from '@phosphor-icons/react'

interface ScenarioEditorProps {
  scenarioForm: ScenarioQuestion
  setScenarioForm: React.Dispatch<React.SetStateAction<ScenarioQuestion>>
}

export function ScenarioEditor({ scenarioForm, setScenarioForm }: ScenarioEditorProps) {
  const handleAddStep = () => {
    const newStep: ScenarioStep = {
      id: `step-${scenarioForm.steps.length + 1}`,
      situation: '',
      context: '',
      options: [],
    }
    setScenarioForm({ ...scenarioForm, steps: [...scenarioForm.steps, newStep] })
  }

  const handleDeleteStep = (stepIndex: number) => {
    if (!confirm('¿Eliminar este paso del escenario?')) return
    const updatedSteps = scenarioForm.steps.filter((_, i) => i !== stepIndex)
    setScenarioForm({ ...scenarioForm, steps: updatedSteps })
  }

  const handleUpdateStep = (stepIndex: number, field: keyof ScenarioStep, value: any) => {
    const updatedSteps = [...scenarioForm.steps]
    updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], [field]: value }
    setScenarioForm({ ...scenarioForm, steps: updatedSteps })
  }

  const handleAddOption = (stepIndex: number) => {
    const newOption: ScenarioOption = {
      id: `opt-${stepIndex}-${scenarioForm.steps[stepIndex].options.length + 1}`,
      text: '',
      consequence: '',
      isCorrect: false,
      score: 0,
    }
    const updatedSteps = [...scenarioForm.steps]
    updatedSteps[stepIndex].options.push(newOption)
    setScenarioForm({ ...scenarioForm, steps: updatedSteps })
  }

  const handleDeleteOption = (stepIndex: number, optionIndex: number) => {
    const updatedSteps = [...scenarioForm.steps]
    updatedSteps[stepIndex].options = updatedSteps[stepIndex].options.filter((_, i) => i !== optionIndex)
    setScenarioForm({ ...scenarioForm, steps: updatedSteps })
  }

  const handleUpdateOption = (stepIndex: number, optionIndex: number, field: keyof ScenarioOption, value: any) => {
    const updatedSteps = [...scenarioForm.steps]
    updatedSteps[stepIndex].options[optionIndex] = {
      ...updatedSteps[stepIndex].options[optionIndex],
      [field]: value,
    }
    setScenarioForm({ ...scenarioForm, steps: updatedSteps })
  }

  return (
    <div className="space-y-4">
      {/* Scenario Metadata */}
      <div className="space-y-2">
        <Label htmlFor="scenario-title">Título del Escenario *</Label>
        <Input
          id="scenario-title"
          placeholder="ej. Cliente Frustrado por Retraso"
          value={scenarioForm.title}
          onChange={(e) => setScenarioForm({ ...scenarioForm, title: e.target.value })}
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="scenario-description">Descripción *</Label>
        <Textarea
          id="scenario-description"
          placeholder="Describe el escenario interactivo..."
          value={scenarioForm.description}
          onChange={(e) => setScenarioForm({ ...scenarioForm, description: e.target.value })}
          rows={2}
          maxLength={300}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-step">ID de Paso Inicial *</Label>
          <Input
            id="start-step"
            placeholder="step-1"
            value={scenarioForm.startStepId}
            onChange={(e) => setScenarioForm({ ...scenarioForm, startStepId: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="perfect-score">Puntaje Perfecto *</Label>
          <Input
            id="perfect-score"
            type="number"
            min={0}
            max={200}
            value={scenarioForm.perfectScore}
            onChange={(e) => setScenarioForm({ ...scenarioForm, perfectScore: parseInt(e.target.value) || 100 })}
          />
        </div>
      </div>

      <Separator />

      {/* Steps Editor */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold flex items-center gap-2">
            <FlowArrow size={18} />
            Pasos del Escenario ({scenarioForm.steps.length})
          </Label>
          <Button onClick={handleAddStep} size="sm" variant="outline">
            <Plus className="mr-1" size={14} />
            Agregar Paso
          </Button>
        </div>

        {scenarioForm.steps.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Agrega al menos un paso con opciones para crear el árbol de decisiones.
            </AlertDescription>
          </Alert>
        ) : (
          <ScrollArea className="h-[400px] border rounded-lg p-4">
            <div className="space-y-4">
              {scenarioForm.steps.map((step, stepIndex) => (
                <Card key={step.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Target size={14} />
                        {step.id}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive h-7 w-7 p-0"
                        onClick={() => handleDeleteStep(stepIndex)}
                      >
                        <Trash size={14} />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Situación *</Label>
                      <Input
                        placeholder="Título de este paso..."
                        value={step.situation}
                        onChange={(e) => handleUpdateStep(stepIndex, 'situation', e.target.value)}
                        maxLength={100}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Contexto</Label>
                      <Textarea
                        placeholder="Descripción del escenario en este punto..."
                        value={step.context || ''}
                        onChange={(e) => handleUpdateStep(stepIndex, 'context', e.target.value)}
                        rows={2}
                        maxLength={500}
                      />
                    </div>

                    {/* Options for this step */}
                    <div className="space-y-2 pl-3 border-l-2">
                      <Label className="text-xs font-semibold">Opciones de Decisión ({step.options.length})</Label>
                      {step.options.map((option, optionIndex) => (
                        <Card key={option.id} className="p-3 bg-muted/30">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-mono text-muted-foreground">{option.id}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-destructive"
                                onClick={() => handleDeleteOption(stepIndex, optionIndex)}
                              >
                                <Trash size={12} />
                              </Button>
                            </div>

                            <Input
                              placeholder="Texto de la opción..."
                              value={option.text}
                              onChange={(e) => handleUpdateOption(stepIndex, optionIndex, 'text', e.target.value)}
                              className="text-sm"
                              maxLength={200}
                            />

                            <Textarea
                              placeholder="Consecuencia de elegir esta opción..."
                              value={option.consequence}
                              onChange={(e) => handleUpdateOption(stepIndex, optionIndex, 'consequence', e.target.value)}
                              rows={2}
                              className="text-sm"
                              maxLength={300}
                            />

                            <div className="grid grid-cols-3 gap-2">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`correct-${stepIndex}-${optionIndex}`}
                                  checked={option.isCorrect}
                                  onCheckedChange={(checked) =>
                                    handleUpdateOption(stepIndex, optionIndex, 'isCorrect', checked)
                                  }
                                />
                                <Label htmlFor={`correct-${stepIndex}-${optionIndex}`} className="text-xs">
                                  Correcta
                                </Label>
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Puntos</Label>
                                <Input
                                  type="number"
                                  min={-20}
                                  max={50}
                                  value={option.score}
                                  onChange={(e) =>
                                    handleUpdateOption(stepIndex, optionIndex, 'score', parseInt(e.target.value) || 0)
                                  }
                                  className="h-7 text-xs"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Siguiente</Label>
                                <Select
                                  value={option.nextScenarioId || '__NONE__'}
                                  onValueChange={(value) =>
                                    handleUpdateOption(
                                      stepIndex,
                                      optionIndex,
                                      'nextScenarioId',
                                      value === '__NONE__' ? undefined : value
                                    )
                                  }
                                >
                                  <SelectTrigger className="h-7 text-xs">
                                    <SelectValue placeholder="Fin" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="__NONE__">Sin siguiente (Fin)</SelectItem>
                                    {scenarioForm.steps.map((s) => (
                                      <SelectItem key={s.id} value={s.id}>
                                        {s.id}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-7 text-xs"
                        onClick={() => handleAddOption(stepIndex)}
                      >
                        <Plus className="mr-1" size={12} />
                        Agregar Opción
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}
