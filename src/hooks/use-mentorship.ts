import { useState } from 'react'
import { MentorshipPairing, MentorMessage, UserProfile } from '@/lib/types'
import { toast } from 'sonner'

export function useMentorship(currentUserId?: string) {
  const [pairings, setPairings] = useState<MentorshipPairing[]>([])
  const [messages, setMessages] = useState<MentorMessage[]>([])
  const profiles: UserProfile[] = []

  const getMentorPairings = (mentorId: string): MentorshipPairing[] => {
    return (pairings || []).filter(
      p => p.mentorId === mentorId && p.status === 'active'
    )
  }

  const getMenteePairing = (menteeId: string): MentorshipPairing | undefined => {
    return (pairings || []).find(
      p => p.menteeId === menteeId && p.status === 'active'
    )
  }

  const getMentorProfile = (mentorId: string): UserProfile | undefined => {
    return (profiles || []).find(p => p.id === mentorId)
  }

  const getMenteeProfile = (menteeId: string): UserProfile | undefined => {
    return (profiles || []).find(p => p.id === menteeId)
  }

  const createPairing = (mentorId: string, menteeId: string, assignedBy: string) => {
    const existingPairing = (pairings || []).find(
      p => p.menteeId === menteeId && p.status === 'active'
    )

    if (existingPairing) {
      toast.error('Este usuario ya tiene un mentor asignado')
      return false
    }

    const newPairing: MentorshipPairing = {
      id: `pairing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      mentorId,
      menteeId,
      assignedAt: Date.now(),
      assignedBy,
      status: 'active'
    }

    setPairings((current) => [...(current || []), newPairing])
    toast.success('Mentoría asignada exitosamente')
    return true
  }

  const removePairing = (pairingId: string) => {
    setPairings((current) =>
      (current || []).map(p =>
        p.id === pairingId ? { ...p, status: 'removed' as const } : p
      )
    )
    toast.success('Mentoría removida')
  }

  const sendMessage = (pairingId: string, senderId: string, senderName: string, receiverId: string, content: string) => {
    const newMessage: MentorMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      pairingId,
      senderId,
      senderName,
      receiverId,
      content,
      timestamp: Date.now(),
      read: false
    }

    setMessages((current) => [...(current || []), newMessage])
    toast.success('Mensaje enviado')
  }

  const getMessagesForPairing = (pairingId: string): MentorMessage[] => {
    return (messages || [])
      .filter(m => m.pairingId === pairingId)
      .sort((a, b) => a.timestamp - b.timestamp)
  }

  const markMessagesAsRead = (pairingId: string, userId: string) => {
    setMessages((current) =>
      (current || []).map(m =>
        m.pairingId === pairingId && m.receiverId === userId
          ? { ...m, read: true }
          : m
      )
    )
  }

  const getUnreadCount = (userId: string): number => {
    return (messages || []).filter(m => m.receiverId === userId && !m.read).length
  }

  return {
    pairings: pairings || [],
    messages: messages || [],
    getMentorPairings,
    getMenteePairing,
    getMentorProfile,
    getMenteeProfile,
    createPairing,
    removePairing,
    sendMessage,
    getMessagesForPairing,
    markMessagesAsRead,
    getUnreadCount
  }
}
