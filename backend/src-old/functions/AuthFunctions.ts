/**
 * Auth Functions - AccessLearn Backend
 * Basic authentication without Azure AD (for development)
 */

import { getContainer } from '../services/cosmosdb.service';
import { User } from '../models/User';

export interface LoginRequest {
  email: string;
  password: string;
  tenantId: string;
}

export interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId: string;
  };
  token?: string;
  error?: string;
}

/**
 * Basic login - validates user exists
 * NOTE: This is a simplified version for development
 * In production, use Azure AD B2C or proper password hashing
 */
export async function login(request: LoginRequest): Promise<LoginResponse> {
  const { email, tenantId } = request;

  try {
    const container = getContainer('users');

    // Query user by email and tenantId
    const query = {
      query: 'SELECT * FROM c WHERE c.email = @email AND c.tenantId = @tenantId',
      parameters: [
        { name: '@email', value: email },
        { name: '@tenantId', value: tenantId },
      ],
    };

    const { resources } = await container.items.query<User>(query).fetchAll();

    if (resources.length === 0) {
      return {
        success: false,
        error: 'Usuario no encontrado o credenciales incorrectas.',
      };
    }

    const user = resources[0];

    // Check if user is active (could add more validations here)
    if (user.status === 'inactive') {
      return {
        success: false,
        error: 'Esta cuenta ha sido desactivada. Contacta al administrador.',
      };
    }

    // Update last login
    user.lastLoginAt = new Date().toISOString();
    await container.items.upsert(user);

    // Generate simple token (in production, use JWT)
    const token = Buffer.from(`${user.id}:${user.tenantId}:${Date.now()}`).toString('base64');

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
      },
      token,
    };
  } catch (error: any) {
    console.error('[Auth] Error during login:', error);
    return {
      success: false,
      error: 'Error al procesar la solicitud. Intenta de nuevo.',
    };
  }
}

/**
 * Validate token and get user info
 * NOTE: Simplified for development
 */
export async function validateToken(token: string): Promise<LoginResponse> {
  try {
    // Decode token
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId, tenantId] = decoded.split(':');

    if (!userId || !tenantId) {
      return {
        success: false,
        error: 'Token inválido',
      };
    }

    const container = getContainer('users');
    const { resource } = await container.item(userId, tenantId).read<User>();

    if (!resource) {
      return {
        success: false,
        error: 'Usuario no encontrado',
      };
    }

    return {
      success: true,
      user: {
        id: resource.id,
        email: resource.email,
        firstName: resource.firstName,
        lastName: resource.lastName,
        role: resource.role,
        tenantId: resource.tenantId,
      },
      token,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Token inválido o expirado',
    };
  }
}
