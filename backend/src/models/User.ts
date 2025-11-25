/**
 * User Model - Kaido Backend
 * 
 * Cumplimiento Mexicano:
 * - CURP: Clave Única de Registro de Población (18 caracteres)
 * - RFC: Registro Federal de Contribuyentes (13 caracteres con homoclave)
 * - NSS: Número de Seguridad Social (11 dígitos)
 */

/**
 * Sistema de Roles Granular v2.0
 * 
 * Jerarquía:
 * - super-admin: Acceso completo a nivel plataforma (multi-tenant)
 * - tenant-admin: Administrador completo de una organización
 * - content-manager: Gestión de cursos y contenido
 * - user-manager: Gestión de usuarios y equipos
 * - analytics-viewer: Acceso solo lectura a analytics
 * - instructor: Creación de cursos (con aprobación)
 * - mentor: Guía de estudiantes
 * - student: Experiencia de aprendizaje
 */
export type UserRole = 
  | 'super-admin'      // Platform-level admin (multi-tenant)
  | 'tenant-admin'     // Organization admin
  | 'content-manager'  // Course & content management
  | 'user-manager'     // User & team management
  | 'analytics-viewer' // Read-only analytics access
  | 'instructor'       // Course creator (needs approval)
  | 'mentor'           // Student guidance
  | 'student';         // Learning experience

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface User {
  id: string;                    // user-{uuid}
  tenantId: string;              // tenant-{slug}
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  
  // Custom Permissions (optional overrides)
  customPermissions?: string[];  // Array of permission strings (e.g., ['courses:create', 'users:view'])
  
  // Authentication
  password?: string;             // Temporary password or hashed password
  passwordResetRequired?: boolean; // Force password change on first login
  
  // Mexican Compliance Fields
  curp?: string;                 // Clave Única de Registro de Población
  rfc?: string;                  // Registro Federal de Contribuyentes
  nss?: string;                  // Número de Seguridad Social
  
  // Profile
  phone?: string;
  dateOfBirth?: string;          // ISO 8601: YYYY-MM-DD
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  avatar?: string;               // URL to profile picture
  
  // Address (Optional)
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Learning Progress
  enrolledCourses: string[];     // Array of course IDs
  completedCourses: string[];    // Array of completed course IDs
  totalXP: number;               // Gamification points
  level: number;                 // User level (1-100)
  badges: string[];              // Array of earned badge IDs
  
  // Email Invitations
  invitationToken?: string;      // Invitation token for email verification
  invitationExpiresAt?: string;  // ISO 8601 - When invitation expires
  invitationAcceptedAt?: string; // ISO 8601 - When user accepted invitation
  invitedBy?: string;            // User ID who sent the invitation
  invitedAt?: string;            // ISO 8601 - When invitation was sent
  
  // Metadata
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
  lastLoginAt?: string;          // ISO 8601
  createdBy?: string;            // admin user ID who created this user
  deletedAt?: string;            // ISO 8601 - Soft delete timestamp
}

export interface CreateUserRequest {
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  temporaryPassword?: string; // Optional temporary password (defaults to 'Welcome123!' if not provided)
  
  // Optional Mexican Compliance
  curp?: string;
  rfc?: string;
  nss?: string;
  
  // Optional Profile
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  
  // Optional Address
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  status?: UserStatus;
  
  // Can update compliance fields
  curp?: string;
  rfc?: string;
  nss?: string;
  
  // Can update address
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface CourseAttempt {
  attemptNumber: number;         // 1, 2, 3...
  startedAt: string;             // ISO 8601
  completedAt?: string;          // ISO 8601, undefined if in progress
  finalScore: number;            // 0-100
  xpEarned: number;              // XP ganado en este intento
  completedLessons: string[];    // Lecciones completadas en este intento
  quizScores: {
    quizId: string;
    score: number;
    completedAt: string;
  }[];
}

export interface UserProgress {
  id?: string;                   // ID del documento en Cosmos DB
  userId: string;
  tenantId: string;
  courseId: string;
  status?: 'not-started' | 'in-progress' | 'completed'; // Estado del curso
  progress: number;              // 0-100 percentage (mejor score hasta ahora)
  lastAccessedAt: string;        // ISO 8601
  completedLessons: string[];    // Array of lesson IDs (acumulativo)
  quizScores: {
    quizId: string;
    score: number;
    attempts: number;
    completedAt: string;
  }[];
  certificateEarned: boolean;
  certificateId?: string;
  
  // Sistema de re-intentos
  attempts: CourseAttempt[];     // Historial completo de intentos
  bestScore: number;             // Mejor puntuación obtenida (0-100)
  totalXpEarned: number;         // XP total acumulado del curso
  currentAttempt: number;        // Número de intento actual
}
