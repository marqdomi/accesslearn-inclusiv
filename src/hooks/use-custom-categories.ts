/**
 * Hook para gestionar categorías personalizadas de cursos
 * Guarda las categorías en Cosmos DB y permite agregar nuevas
 */

import { useState, useEffect } from 'react'
import { useTenant } from '@/contexts/TenantContext'
import { ApiService } from '@/services/api.service'
import { toast } from 'sonner'

const DEFAULT_CATEGORIES = [
  'Programación',
  'Ciencia de Datos',
  'Diseño',
  'Negocios',
  'Marketing',
  'Desarrollo Personal',
  'Idiomas',
  'Salud y Bienestar',
  'Tecnología',
  'Arte y Creatividad',
]

export function useCustomCategories() {
  const { currentTenant } = useTenant()
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(true)

  // Load categories from Cosmos DB on mount
  useEffect(() => {
    const loadCategories = async () => {
      if (!currentTenant) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const backendCategories = await ApiService.getCategories()
        const customCategoryNames = backendCategories.map(c => c.name)
        
        // Merge with default categories, removing duplicates
        const merged = [...new Set([...DEFAULT_CATEGORIES, ...customCategoryNames])]
        setCategories(merged.sort())
      } catch (error) {
        console.error('Error loading categories from Cosmos DB:', error)
        // Fallback to defaults if API fails
        setCategories(DEFAULT_CATEGORIES)
        toast.error('Error al cargar categorías, usando categorías por defecto')
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [currentTenant?.id])

  const addCategory = async (category: string) => {
    if (!currentTenant) {
      toast.error('No se puede agregar categoría: falta información del tenant')
      return false
    }

    const trimmed = category.trim()
    if (!trimmed) {
      toast.error('El nombre de la categoría no puede estar vacío')
      return false
    }
    
    // Check if category already exists (case-insensitive)
    const normalizedTrimmed = trimmed.toLowerCase()
    if (categories.some(c => c.toLowerCase() === normalizedTrimmed)) {
      toast.error('La categoría ya existe')
      return false
    }

    try {
      // Save to Cosmos DB
      await ApiService.createCategory(trimmed)
      
      // Update local state
      const newCategories = [...categories, trimmed].sort()
      setCategories(newCategories)
      
      toast.success('Categoría agregada exitosamente')
      return true
    } catch (error: any) {
      console.error('[useCustomCategories] Error saving category to Cosmos DB:', error)
      
      // Handle specific error cases
      if (error.status === 409 || error.message?.includes('already exists') || error.message?.includes('Category already exists')) {
        toast.error('La categoría ya existe')
        // Refresh categories to get latest list
        try {
          const backendCategories = await ApiService.getCategories()
          const customCategoryNames = backendCategories.map(c => c.name)
          const merged = [...new Set([...DEFAULT_CATEGORIES, ...customCategoryNames])]
          setCategories(merged.sort())
        } catch (refreshError) {
          console.error('[useCustomCategories] Error refreshing categories:', refreshError)
        }
      } else if (error.status === 403) {
        toast.error('No tienes permisos para crear categorías. Contacta al administrador.')
      } else if (error.status === 401) {
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
      } else if (error.status === 400) {
        toast.error(error.message || 'El nombre de la categoría es inválido')
      } else {
        // Generic error - show more details in console
        console.error('[useCustomCategories] Full error details:', {
          status: error.status,
          message: error.message,
          error
        })
        toast.error(`Error al guardar la categoría: ${error.message || 'Error desconocido'}`)
      }
      return false
    }
  }

  return {
    categories,
    addCategory,
    loading,
  }
}
