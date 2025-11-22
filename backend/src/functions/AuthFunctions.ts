/**
 * Auth Functions - AccessLearn Backend
 * JWT-based authentication for production-ready security
 */

import jwt from 'jsonwebtoken';
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
    customPermissions?: string[];
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
  let { email, password, tenantId } = request;

  try {
    // If tenantId looks like a slug (no 'tenant-' prefix), resolve it to the full ID
    if (tenantId && !tenantId.startsWith('tenant-')) {
      const tenantContainer = getContainer('tenants');
      const tenantQuery = {
        query: 'SELECT c.id FROM c WHERE c.slug = @slug',
        parameters: [{ name: '@slug', value: tenantId }],
      };
      
      const { resources: tenants } = await tenantContainer.items.query(tenantQuery).fetchAll();
      if (tenants.length === 0) {
        return {
          success: false,
          error: 'Tenant no encontrado.',
        };
      }
      tenantId = tenants[0].id;
    }

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

    // Validate password (using SHA-256 hash)
    // In production, use bcrypt.compare(password, user.passwordHash)
    const crypto = require('crypto');
    const hashPassword = (pwd: string) => crypto.createHash('sha256').update(pwd).digest('hex');
    const hashedPassword = hashPassword(password);
    
    if (user.password && hashedPassword !== user.password) {
      return {
        success: false,
        error: 'Usuario no encontrado o credenciales incorrectas.',
      };
    }

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

    // Generate JWT token
    const jwtSecret: string = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const tokenExpiry: string = process.env.JWT_EXPIRY || '24h'; // Default 24 hours
    
    const tokenPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, jwtSecret, {
      expiresIn: tokenExpiry,
      issuer: 'accesslearn-api',
      audience: 'accesslearn-frontend',
    } as jwt.SignOptions);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
        customPermissions: user.customPermissions,
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
 * Validate JWT token and get user info
 */
export async function validateToken(token: string): Promise<LoginResponse> {
  try {
    const jwtSecret: string = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, jwtSecret, {
        issuer: 'accesslearn-api',
        audience: 'accesslearn-frontend',
      });
    } catch (jwtError: any) {
      if (jwtError.name === 'TokenExpiredError') {
        return {
          success: false,
          error: 'Token expirado. Por favor, inicia sesión nuevamente.',
        };
      } else if (jwtError.name === 'JsonWebTokenError') {
        return {
          success: false,
          error: 'Token inválido',
        };
      }
      throw jwtError;
    }

    // Extract user info from token
    const { userId, tenantId } = decoded;

    if (!userId || !tenantId) {
      return {
        success: false,
        error: 'Token inválido: información de usuario faltante',
      };
    }

    // Fetch user from database to ensure they still exist and are active
    const container = getContainer('users');
    const { resource } = await container.item(userId, tenantId).read<User>();

    if (!resource) {
      return {
        success: false,
        error: 'Usuario no encontrado',
      };
    }

    // Check if user is still active
    if (resource.status === 'inactive') {
      return {
        success: false,
        error: 'Esta cuenta ha sido desactivada',
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
        customPermissions: resource.customPermissions,
      },
      token,
    };
  } catch (error: any) {
    console.error('[Auth] Error validating token:', error);
    return {
      success: false,
      error: 'Error al validar el token',
    };
  }
}
