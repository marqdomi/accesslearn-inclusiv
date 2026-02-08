/**
 * 404 Not Found Page
 * Fun, branded error page with navigation options
 */

import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { House, MagnifyingGlass, BookOpen, ArrowLeft } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* Animated 404 */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-6"
        >
          <div className="relative inline-block">
            <span className="text-[120px] sm:text-[160px] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 leading-none select-none">
              404
            </span>
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -right-4 top-4"
            >
              <span className="text-4xl">🔍</span>
            </motion.div>
          </div>
        </motion.div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2">¡Página no encontrada!</h1>
        <p className="text-muted-foreground mb-8 text-sm sm:text-base">
          Parece que esta lección aún no se ha creado. No te preocupes, hay mucho más por explorar.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate(-1)} variant="outline" className="gap-2">
            <ArrowLeft size={18} />
            Regresar
          </Button>
          <Button onClick={() => navigate('/dashboard')} className="gap-2">
            <House size={18} />
            Ir al Dashboard
          </Button>
        </div>

        {/* Quick links */}
        <div className="mt-8 pt-8 border-t">
          <p className="text-xs text-muted-foreground mb-3">Accesos Rápidos</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/catalog')}
              className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <BookOpen size={20} />
              Catálogo
            </button>
            <button
              onClick={() => navigate('/library')}
              className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <MagnifyingGlass size={20} />
              Mi Biblioteca
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
