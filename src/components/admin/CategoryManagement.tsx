import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { ApiService } from '@/services/api.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
  Loader2,
  BarChart3,
} from 'lucide-react'

interface Category {
  id: string
  name: string
  tenantId: string
}

interface CategoryWithStats extends Category {
  courseCount: number
}

export function CategoryManagement() {
  const { user } = useAuth()
  const { currentTenant } = useTenant()
  const [categories, setCategories] = useState<CategoryWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editCategoryName, setEditCategoryName] = useState('')
  const [coursesByCategory, setCoursesByCategory] = useState<Record<string, number>>({})

  useEffect(() => {
    loadCategories()
  }, [currentTenant?.id])

  const loadCategories = async () => {
    if (!currentTenant) return

    try {
      setLoading(true)
      const backendCategories = await ApiService.getCategories()
      
      // Load course counts for each category
      const courses = await ApiService.getCourses(currentTenant.id)
      const categoryCounts: Record<string, number> = {}
      
      courses.forEach(course => {
        if (course.category) {
          categoryCounts[course.category] = (categoryCounts[course.category] || 0) + 1
        }
      })
      
      setCoursesByCategory(categoryCounts)
      
      // Merge with stats
      const categoriesWithStats: CategoryWithStats[] = backendCategories.map(cat => ({
        ...cat,
        courseCount: categoryCounts[cat.name] || 0
      }))
      
      setCategories(categoriesWithStats.sort((a, b) => a.name.localeCompare(b.name)))
    } catch (error: any) {
      console.error('Error loading categories:', error)
      toast.error('Error al cargar las categorías')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('El nombre de la categoría no puede estar vacío')
      return
    }

    try {
      setIsCreating(true)
      await ApiService.createCategory(newCategoryName.trim())
      toast.success('Categoría creada exitosamente')
      setNewCategoryName('')
      setIsCreating(false)
      await loadCategories()
    } catch (error: any) {
      console.error('Error creating category:', error)
      if (error.status === 409) {
        toast.error('La categoría ya existe')
      } else if (error.status === 403) {
        toast.error('No tienes permisos para crear categorías')
      } else {
        toast.error(error.message || 'Error al crear la categoría')
      }
      setIsCreating(false)
    }
  }

  const handleEditCategory = async () => {
    if (!editingCategory || !editCategoryName.trim()) {
      return
    }

    if (editCategoryName.trim() === editingCategory.name) {
      setEditingCategory(null)
      return
    }

    try {
      // Note: We need to add an updateCategory endpoint in the backend
      // For now, we'll show a message that this feature needs backend support
      toast.info('La edición de categorías requiere actualización del backend')
      setEditingCategory(null)
      // TODO: Implement when backend endpoint is available
      // await ApiService.updateCategory(editingCategory.id, editCategoryName.trim())
      // await loadCategories()
    } catch (error: any) {
      console.error('Error editing category:', error)
      toast.error('Error al editar la categoría')
    }
  }

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return

    const courseCount = coursesByCategory[deletingCategory.name] || 0
    
    if (courseCount > 0) {
      toast.error(`No se puede eliminar: ${courseCount} curso(s) usan esta categoría`)
      setDeletingCategory(null)
      return
    }

    try {
      await ApiService.deleteCategory(deletingCategory.id)
      toast.success('Categoría eliminada exitosamente')
      setDeletingCategory(null)
      await loadCategories()
    } catch (error: any) {
      console.error('Error deleting category:', error)
      if (error.status === 403) {
        toast.error('No tienes permisos para eliminar categorías')
      } else {
        toast.error('Error al eliminar la categoría')
      }
      setDeletingCategory(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Cargando categorías...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Gestión de Categorías</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Administra las categorías de cursos disponibles en tu organización
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2 w-full sm:w-auto touch-target">
          <Plus size={18} />
          Nueva Categoría
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Categorías
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{categories.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categorías en Uso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">
                {categories.filter(c => c.courseCount > 0).length}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categorías Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">
                {categories.filter(c => c.courseCount === 0).length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Categorías</CardTitle>
          <CardDescription className="text-sm">
            Lista de todas las categorías disponibles. Las categorías en uso no pueden eliminarse.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay categorías creadas aún</p>
              <Button onClick={() => setIsCreating(true)} className="mt-4 gap-2 touch-target">
                <Plus size={18} />
                Crear Primera Categoría
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop: Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Cursos</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{category.courseCount}</Badge>
                        </TableCell>
                        <TableCell>
                          {category.courseCount > 0 ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              En uso
                            </Badge>
                          ) : (
                            <Badge variant="outline">Disponible</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingCategory(category)
                                setEditCategoryName(category.name)
                              }}
                              disabled={category.courseCount > 0}
                              title={category.courseCount > 0 ? 'No se puede editar categorías en uso' : 'Editar categoría'}
                              className="touch-target"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingCategory(category)}
                              disabled={category.courseCount > 0}
                              title={category.courseCount > 0 ? 'No se puede eliminar categorías en uso' : 'Eliminar categoría'}
                              className="touch-target"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile: Cards */}
              <div className="md:hidden space-y-3">
                {categories.map((category) => (
                  <Card key={category.id} className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base mb-2">{category.name}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {category.courseCount} cursos
                          </Badge>
                          {category.courseCount > 0 ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              En uso
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Disponible</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-3 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCategory(category)
                          setEditCategoryName(category.name)
                        }}
                        disabled={category.courseCount > 0}
                        className="touch-target flex-1"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingCategory(category)}
                        disabled={category.courseCount > 0}
                        className="touch-target flex-1 text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Category Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-[95vw] sm:max-w-md p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Nueva Categoría</DialogTitle>
            <DialogDescription className="text-sm">
              Crea una nueva categoría para organizar tus cursos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nombre de la categoría</label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ej: Recursos Humanos, Tecnología..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newCategoryName.trim()) {
                    handleCreateCategory()
                  }
                }}
                autoFocus
                className="h-12 touch-target"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsCreating(false)} className="w-full sm:w-auto touch-target">
              Cancelar
            </Button>
            <Button onClick={handleCreateCategory} disabled={!newCategoryName.trim()} className="w-full sm:w-auto touch-target">
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-md p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Editar Categoría</DialogTitle>
            <DialogDescription className="text-sm">
              Modifica el nombre de la categoría
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nombre de la categoría</label>
              <Input
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                placeholder="Nombre de la categoría"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && editCategoryName.trim()) {
                    handleEditCategory()
                  }
                }}
                autoFocus
                className="h-12 touch-target"
              />
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Nota: La edición de categorías requiere actualización del backend. Esta funcionalidad estará disponible próximamente.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)}>
              Cancelar
            </Button>
            <Button onClick={handleEditCategory} disabled={!editCategoryName.trim()}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Categoría</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar esta categoría?
            </DialogDescription>
          </DialogHeader>
          {deletingCategory && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {coursesByCategory[deletingCategory.name] > 0 ? (
                    <>
                      No se puede eliminar esta categoría porque {coursesByCategory[deletingCategory.name]} curso(s) la están usando.
                      Primero debes cambiar la categoría de esos cursos.
                    </>
                  ) : (
                    'Esta acción no se puede deshacer. La categoría será eliminada permanentemente.'
                  )}
                </AlertDescription>
              </Alert>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeletingCategory(null)} className="w-full sm:w-auto touch-target">
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCategory}
              disabled={deletingCategory ? coursesByCategory[deletingCategory.name] > 0 : false}
              className="w-full sm:w-auto touch-target"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

