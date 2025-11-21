/**
 * Authentication Middleware
 * Validates JWT tokens and attaches user to request
 */

import { Request, Response, NextFunction } from 'express';
import { validateToken } from '../functions/AuthFunctions';

/**
 * Middleware to validate JWT token and attach user to request
 */
export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      // No token provided - continue without user (public routes)
      return next();
    }

    // Validate token
    const result = await validateToken(token);

    if (result.success && result.user) {
      // Attach user to request
      req.user = {
        id: result.user.id,
        tenantId: result.user.tenantId,
        role: result.user.role as any,
        email: result.user.email
      };
    }

    next();
  } catch (error) {
    console.error('[Auth Middleware] Error validating token:', error);
    // Continue without user - let requireAuth handle it
    next();
  }
}
