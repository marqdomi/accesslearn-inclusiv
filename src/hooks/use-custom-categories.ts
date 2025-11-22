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
    if (!currentTenant) return false

    const trimmed = category.trim()
    if (!trimmed || categories.includes(trimmed)) {
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
      console.error('Error saving category to Cosmos DB:', error)
      if (error.message?.includes('already exists') || error.status === 409) {
        toast.error('La categoría ya existe')
      } else {
        toast.error('Error al guardar la categoría')
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
