// Shared types for backend mentorship functions

export type MentorshipRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled'
export type MentorshipSessionStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled'

export interface MentorshipRequest {
  id: string
  tenantId: string
  menteeId: string
  menteeName: string
  menteeEmail: string
  mentorId: string
  mentorName: string
  mentorEmail?: string
  topic: string
  message: string
  preferredDate?: number
  status: MentorshipRequestStatus
  createdAt: number
  respondedAt?: number
}

export interface MentorshipSession {
  id: string
  tenantId: string
  requestId?: string
  mentorId: string
  mentorName: string
  menteeId: string
  menteeName: string
  topic: string
  scheduledDate: number
  duration: number
  status: MentorshipSessionStatus
  notes?: string
  sharedResources?: string[]
  rating?: number
  feedback?: string
  completedAt?: number
  createdAt: number
  xpAwarded?: boolean
}

export interface MentorProfile {
  userId: string
  name: string
  email: string
  avatar?: string
  bio?: string
  specialties: string[]
  availability: {
    monday?: string[]
    tuesday?: string[]
    wednesday?: string[]
    thursday?: string[]
    friday?: string[]
    saturday?: string[]
    sunday?: string[]
  }
  rating: number
  totalSessions: number
  totalMentees: number
  isAvailable: boolean
}
