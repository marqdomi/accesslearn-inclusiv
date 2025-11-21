import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Star, 
  Calendar, 
  TrendingUp, 
  Users,
  MessageSquare,
  Filter,
  ArrowLeft,
  ClipboardList
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { ApiService } from '@/services/api.service'
import { MentorProfile } from '@/lib/types'
import { RequestMentorshipModal } from '@/components/mentorship/RequestMentorshipModal'
import { toast } from 'sonner'

export function MentorDirectoryPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentTenant } = useTenant()

  const [loading, setLoading] = useState(true)
  const [mentors, setMentors] = useState<MentorProfile[]>([])
  const [filteredMentors, setFilteredMentors] = useState<MentorProfile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all')
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    loadMentors()
    loadNotifications()
  }, [currentTenant, user])

  useEffect(() => {
    filterMentors()
  }, [searchQuery, selectedSpecialty, mentors])

  const loadMentors = async () => {
    if (!currentTenant) return

    try {
      setLoading(true)
      const data = await ApiService.getAvailableMentors(currentTenant.id)
      setMentors(data)
      setFilteredMentors(data)
    } catch (error) {
      console.error('Error loading mentors:', error)
      toast.error('Error al cargar mentores')
    } finally {
      setLoading(false)
    }
  }

  const loadNotifications = async () => {
    if (!currentTenant || !user) return

    try {
      // Load scheduled sessions for students
      const scheduledSessions = await ApiService.getMenteeSessions(currentTenant.id, user.id, 'scheduled')
      setNotificationCount(scheduledSessions.length)
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const filterMentors = () => {
    let filtered = [...mentors]

    // Filtrar por búsqueda (nombre o especialidad)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        m =>
          m.name.toLowerCase().includes(query) ||
          m.specialties.some(s => s.toLowerCase().includes(query)) ||
          (m.bio && m.bio.toLowerCase().includes(query))
      )
    }

    // Filtrar por especialidad
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(m =>
        m.specialties.some(s => s.toLowerCase().includes(selectedSpecialty.toLowerCase()))
      )
    }

    setFilteredMentors(filtered)
  }

  const getAllSpecialties = () => {
    const specialties = new Set<string>()
    mentors.forEach(m => m.specialties.forEach(s => specialties.add(s)))
    return Array.from(specialties).sort()
  }

  const handleRequestMentorship = (mentor: MentorProfile) => {
    if (!user || !currentTenant) {
      toast.error('Debes iniciar sesión para solicitar mentoría')
      return
    }
    setSelectedMentor(mentor)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedMentor(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando mentores...</p>
        </div>
      </div>
    )
  }

  const specialties = getAllSpecialties()

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="gap-2 mb-4"
        >
          <ArrowLeft size={18} />
          Volver al Dashboard
        </Button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Directorio de Mentores</h1>
          <p className="text-muted-foreground">
            Encuentra el mentor perfecto para tu desarrollo profesional
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/my-mentorships')}
          className="gap-2 relative"
        >
          <ClipboardList className="h-4 w-4" />
          Mis Solicitudes
          {notificationCount > 0 && (
            <Badge 
              variant="default" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {notificationCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, especialidad o tema..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Specialty Filter */}
            <select
              value={selectedSpecialty}
              onChange={e => setSelectedSpecialty(e.target.value)}
              className="px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground w-[200px]"
              aria-label="Filtrar por especialidad"
              title="Filtrar por especialidad"
            >
              <option value="all">Todas las especialidades</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            {filteredMentors.length} {filteredMentors.length === 1 ? 'mentor encontrado' : 'mentores encontrados'}
          </div>
        </div>
      </Card>

      {/* Mentors Grid */}
      {filteredMentors.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No se encontraron mentores
          </h3>
          <p className="text-muted-foreground">
            Intenta ajustar los filtros de búsqueda
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <Card key={mentor.userId} className="p-6 h-full flex flex-col hover:shadow-lg transition-shadow">
                {/* Header with Avatar */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative shrink-0">
                    {mentor.avatar ? (
                      <img
                        src={mentor.avatar}
                        alt={mentor.name}
                        className="w-16 h-16 rounded-full"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-2xl">👨‍🏫</span>
                      </div>
                    )}
                    {mentor.isAvailable && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">{mentor.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-sm font-semibold">
                          {mentor.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({mentor.totalSessions} sesiones)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {mentor.specialties.slice(0, 4).map(specialty => (
                    <Badge key={specialty} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                  {mentor.specialties.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{mentor.specialties.length - 4}
                    </Badge>
                  )}
                </div>

                {/* Bio */}
                <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">
                  {mentor.bio}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-y">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="text-lg font-bold">{mentor.totalMentees}</div>
                    <div className="text-xs text-muted-foreground">Mentorados</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="text-lg font-bold">{mentor.totalSessions}</div>
                    <div className="text-xs text-muted-foreground">Sesiones</div>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  className="w-full gap-2"
                  onClick={() => handleRequestMentorship(mentor)}
                  disabled={!mentor.isAvailable}
                >
                  <MessageSquare className="h-4 w-4" />
                  {mentor.isAvailable ? 'Solicitar Mentoría' : 'No disponible'}
                </Button>

                {/* Availability hint */}
                {mentor.isAvailable && Object.keys(mentor.availability).length > 0 && (
                  <div className="mt-2 text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Disponible {Object.keys(mentor.availability).length} días/semana
                  </div>
                )}
              </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Star className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-2">¿Cómo funcionan las mentorías?</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✓ Selecciona un mentor con la especialidad que necesitas</li>
              <li>✓ Solicita una mentoría explicando tu objetivo</li>
              <li>✓ El mentor revisará tu solicitud y programará una sesión</li>
              <li>✓ Conecta en la fecha programada y aprende</li>
              <li>✓ Califica tu experiencia al finalizar</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Request Modal */}
      {selectedMentor && user && currentTenant && (
        <RequestMentorshipModal
          isOpen={modalOpen}
          onClose={handleModalClose}
          mentor={selectedMentor}
          menteeId={user.id}
          menteeName={`${user.firstName} ${user.lastName}`}
          menteeEmail={user.email}
          tenantId={currentTenant.id}
        />
      )}
    </div>
  )
}
