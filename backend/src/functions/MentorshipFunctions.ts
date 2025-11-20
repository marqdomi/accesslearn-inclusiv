import { CosmosClient, Container } from '@azure/cosmos'
import { 
  MentorshipRequest, 
  MentorshipSession, 
  MentorProfile,
  MentorshipRequestStatus,
  MentorshipSessionStatus 
} from '../types/mentorship.types'

const endpoint = process.env.COSMOS_ENDPOINT!
const key = process.env.COSMOS_KEY!
const databaseId = 'accesslearn-db'

const client = new CosmosClient({ endpoint, key })
const database = client.database(databaseId)

// Containers
const requestsContainer: Container = database.container('mentorship-requests')
const sessionsContainer: Container = database.container('mentorship-sessions')
const usersContainer: Container = database.container('users')

/**
 * Crear una solicitud de mentoría
 */
export async function createMentorshipRequest(
  tenantId: string,
  menteeId: string,
  menteeName: string,
  menteeEmail: string,
  mentorId: string,
  topic: string,
  message: string,
  preferredDate?: number
): Promise<MentorshipRequest> {
  const request: MentorshipRequest = {
    id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    tenantId,
    menteeId,
    menteeName,
    menteeEmail,
    mentorId,
    topic,
    message,
    preferredDate,
    status: 'pending',
    createdAt: Date.now()
  }

  await requestsContainer.items.create(request)
  return request
}

/**
 * Obtener solicitudes pendientes para un mentor
 */
export async function getMentorPendingRequests(
  tenantId: string,
  mentorId: string
): Promise<MentorshipRequest[]> {
  const query = {
    query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.mentorId = @mentorId AND c.status = @status',
    parameters: [
      { name: '@tenantId', value: tenantId },
      { name: '@mentorId', value: mentorId },
      { name: '@status', value: 'pending' }
    ]
  }

  const { resources } = await requestsContainer.items.query<MentorshipRequest>(query).fetchAll()
  return resources
}

/**
 * Aceptar una solicitud de mentoría
 */
export async function acceptMentorshipRequest(
  requestId: string,
  tenantId: string,
  scheduledDate: number,
  duration: number = 60
): Promise<{ request: MentorshipRequest; session: MentorshipSession }> {
  // Actualizar request
  const { resource: request } = await requestsContainer.item(requestId, tenantId).read<MentorshipRequest>()
  
  if (!request) {
    throw new Error('Request not found')
  }

  request.status = 'accepted'
  request.respondedAt = Date.now()
  await requestsContainer.item(requestId, tenantId).replace(request)

  // Crear sesión
  const session: MentorshipSession = {
    id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    tenantId: request.tenantId,
    requestId: request.id,
    mentorId: request.mentorId,
    mentorName: '', // Se llenará desde el perfil
    menteeId: request.menteeId,
    menteeName: request.menteeName,
    topic: request.topic,
    scheduledDate,
    duration,
    status: 'scheduled',
    createdAt: Date.now()
  }

  await sessionsContainer.items.create(session)

  return { request, session }
}

/**
 * Rechazar una solicitud de mentoría
 */
export async function rejectMentorshipRequest(
  requestId: string,
  tenantId: string
): Promise<MentorshipRequest> {
  const { resource: request } = await requestsContainer.item(requestId, tenantId).read<MentorshipRequest>()
  
  if (!request) {
    throw new Error('Request not found')
  }

  request.status = 'rejected'
  request.respondedAt = Date.now()
  await requestsContainer.item(requestId, tenantId).replace(request)

  return request
}

/**
 * Obtener sesiones de un mentor
 */
export async function getMentorSessions(
  tenantId: string,
  mentorId: string,
  status?: MentorshipSessionStatus
): Promise<MentorshipSession[]> {
  let query = {
    query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.mentorId = @mentorId',
    parameters: [
      { name: '@tenantId', value: tenantId },
      { name: '@mentorId', value: mentorId }
    ]
  }

  if (status) {
    query.query += ' AND c.status = @status'
    query.parameters.push({ name: '@status', value: status })
  }

  query.query += ' ORDER BY c.scheduledDate DESC'

  const { resources } = await sessionsContainer.items.query<MentorshipSession>(query).fetchAll()
  return resources
}

/**
 * Obtener sesiones de un aprendiz
 */
export async function getMenteeSessions(
  tenantId: string,
  menteeId: string,
  status?: MentorshipSessionStatus
): Promise<MentorshipSession[]> {
  let query = {
    query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.menteeId = @menteeId',
    parameters: [
      { name: '@tenantId', value: tenantId },
      { name: '@menteeId', value: menteeId }
    ]
  }

  if (status) {
    query.query += ' AND c.status = @status'
    query.parameters.push({ name: '@status', value: status })
  }

  query.query += ' ORDER BY c.scheduledDate DESC'

  const { resources } = await sessionsContainer.items.query<MentorshipSession>(query).fetchAll()
  return resources
}

/**
 * Completar una sesión de mentoría
 */
export async function completeMentorshipSession(
  sessionId: string,
  tenantId: string,
  notes?: string
): Promise<MentorshipSession> {
  const { resource: session } = await sessionsContainer.item(sessionId, tenantId).read<MentorshipSession>()
  
  if (!session) {
    throw new Error('Session not found')
  }

  session.status = 'completed'
  session.completedAt = Date.now()
  if (notes) {
    session.notes = notes
  }

  await sessionsContainer.item(sessionId, tenantId).replace(session)

  return session
}

/**
 * Calificar una sesión de mentoría
 */
export async function rateMentorshipSession(
  sessionId: string,
  tenantId: string,
  rating: number,
  feedback?: string
): Promise<MentorshipSession> {
  const { resource: session } = await sessionsContainer.item(sessionId, tenantId).read<MentorshipSession>()
  
  if (!session) {
    throw new Error('Session not found')
  }

  session.rating = rating
  if (feedback) {
    session.feedback = feedback
  }

  await sessionsContainer.item(sessionId, tenantId).replace(session)

  // Actualizar rating promedio del mentor
  await updateMentorRating(tenantId, session.mentorId)

  return session
}

/**
 * Actualizar el rating promedio de un mentor
 */
async function updateMentorRating(tenantId: string, mentorId: string): Promise<void> {
  const query = {
    query: 'SELECT c.rating FROM c WHERE c.tenantId = @tenantId AND c.mentorId = @mentorId AND c.rating != null',
    parameters: [
      { name: '@tenantId', value: tenantId },
      { name: '@mentorId', value: mentorId }
    ]
  }

  const { resources } = await sessionsContainer.items.query<{ rating: number }>(query).fetchAll()
  
  if (resources.length === 0) return

  const avgRating = resources.reduce((sum, s) => sum + s.rating, 0) / resources.length

  // Actualizar el perfil del mentor (asumiendo que está en users container)
  try {
    const { resource: user } = await usersContainer.item(mentorId, tenantId).read()
    if (user) {
      user.mentorRating = Math.round(avgRating * 10) / 10 // 1 decimal
      user.totalMentorSessions = resources.length
      await usersContainer.item(mentorId, tenantId).replace(user)
    }
  } catch (error) {
    console.error('Error updating mentor rating:', error)
  }
}

/**
 * Obtener todos los mentores disponibles
 */
export async function getAvailableMentors(tenantId: string): Promise<MentorProfile[]> {
  const query = {
    query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.role = @role',
    parameters: [
      { name: '@tenantId', value: tenantId },
      { name: '@role', value: 'mentor' }
    ]
  }

  const { resources } = await usersContainer.items.query(query).fetchAll()

  return resources.map(user => ({
    userId: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    avatar: user.avatar,
    bio: user.mentorBio || 'Mentor experimentado listo para ayudarte.',
    specialties: user.mentorSpecialties || [],
    availability: user.mentorAvailability || {},
    rating: user.mentorRating || 0,
    totalSessions: user.totalMentorSessions || 0,
    totalMentees: user.totalMentees || 0,
    isAvailable: user.mentorIsAvailable !== false
  }))
}

/**
 * Obtener estadísticas de un mentor
 */
export async function getMentorStats(tenantId: string, mentorId: string) {
  const sessions = await getMentorSessions(tenantId, mentorId)
  const completedSessions = sessions.filter(s => s.status === 'completed')
  const ratedSessions = completedSessions.filter(s => s.rating !== undefined)

  const uniqueMentees = new Set(completedSessions.map(s => s.menteeId)).size

  const avgRating = ratedSessions.length > 0
    ? ratedSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / ratedSessions.length
    : 0

  const pendingRequests = await getMentorPendingRequests(tenantId, mentorId)

  return {
    totalSessions: sessions.length,
    completedSessions: completedSessions.length,
    scheduledSessions: sessions.filter(s => s.status === 'scheduled').length,
    totalMentees: uniqueMentees,
    averageRating: Math.round(avgRating * 10) / 10,
    pendingRequests: pendingRequests.length
  }
}
