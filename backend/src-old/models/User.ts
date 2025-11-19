/**
 * User Model - AccessLearn Backend
 * 
 * Cumplimiento Mexicano:
 * - CURP: Clave Única de Registro de Población (18 caracteres)
 * - RFC: Registro Federal de Contribuyentes (13 caracteres con homoclave)
 * - NSS: Número de Seguridad Social (11 dígitos)
 */

export type UserRole = 'admin' | 'mentor' | 'student';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string;                    // user-{uuid}
  tenantId: string;              // tenant-{slug}
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  
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
  
  // Metadata
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
  lastLoginAt?: string;          // ISO 8601
  createdBy?: string;            // admin user ID who created this user
}

export interface CreateUserRequest {
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  
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

export interface UserProgress {
  userId: string;
  tenantId: string;
  courseId: string;
  progress: number;              // 0-100 percentage
  lastAccessedAt: string;        // ISO 8601
  completedLessons: string[];    // Array of lesson IDs
  quizScores: {
    quizId: string;
    score: number;
    attempts: number;
    completedAt: string;
  }[];
  certificateEarned: boolean;
  certificateId?: string;
}
