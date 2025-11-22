/**
 * Telemetry Middleware
 * 
 * Tracks requests, errors, and performance metrics for Application Insights
 */

import { Request, Response, NextFunction } from 'express';
import { trackRequest, trackException, trackMetric, setUserContext } from '../services/applicationinsights.service';

/**
 * Middleware to track HTTP requests
 * Tracks request duration, success/failure, and status codes
 */
export function trackRequestTelemetry(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const originalSend = res.send.bind(res);

  // Track request start
  res.send = function (body: any) {
    const duration = Date.now() - startTime;
    const success = res.statusCode < 400;
    
    // Track the request
    trackRequest(
      `${req.method} ${req.path}`,
      req.originalUrl || req.url,
      duration,
      success,
      res.statusCode,
      {
        method: req.method,
        path: req.path,
        tenantId: (req as any).user?.tenantId || 'unknown',
        userId: (req as any).user?.id || 'anonymous',
      }
    );

    // Track performance metric
    trackMetric(`Request.${req.method}.${req.path.split('/').filter(Boolean).join('.')}`, duration, {
      statusCode: res.statusCode.toString(),
      tenantId: (req as any).user?.tenantId || 'unknown',
    });

    return originalSend(body);
  };

  // Set user context if authenticated
  if ((req as any).user) {
    const user = (req as any).user;
    setUserContext(user.id, user.tenantId, user.email);
  }

  next();
}

/**
 * Error handler middleware that tracks exceptions
 * Should be placed after all routes
 */
export function trackErrorTelemetry(error: any, req: Request, res: Response, next: NextFunction): void {
  // Track the exception
  trackException(error, {
    endpoint: req.path,
    method: req.method,
    tenantId: (req as any).user?.tenantId || 'unknown',
    userId: (req as any).user?.id || 'anonymous',
    errorType: error.name || 'UnknownError',
    errorMessage: error.message || 'Unknown error',
  });

  // Call next error handler
  next(error);
}

