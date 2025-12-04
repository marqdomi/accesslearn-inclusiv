import { useNavigate } from 'react-router-dom'
import { CategoryManagement } from '@/components/admin/CategoryManagement'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function CategoryManagementPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/settings')}
          className="mb-6 gap-2"
        >
          <ArrowLeft size={20} />
          Volver a Configuración
        </Button>

        <CategoryManagement />
      </div>
    </div>
  )
}

