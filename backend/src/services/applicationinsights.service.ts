/**
 * Application Insights Service
 * 
 * Configures Azure Application Insights for monitoring and logging
 * 
 * Usage:
 * - Import and call initializeAppInsights() at the start of server.ts
 * - Use trackException() for error logging
 * - Use trackMetric() for custom metrics
 * - Use trackEvent() for custom events
 */

// Import Application Insights with proper CommonJS support
let appInsights: any;
try {
  appInsights = require('applicationinsights');
} catch (error) {
  console.warn('⚠️  Application Insights package not found. Install with: npm install applicationinsights');
  appInsights = null;
}

let isInitialized = false;

/**
 * Initialize Application Insights
 * Call this once at the start of your application
 */
export function initializeAppInsights(): void {
  // Skip if already initialized
  if (isInitialized) {
    return;
  }

  // Check if applicationinsights package is available
  if (!appInsights || typeof appInsights.setup !== 'function') {
    console.log('⚠️  Application Insights: Package not available. Skipping initialization.');
    console.log('   Install with: npm install applicationinsights');
    return;
  }

  // Get connection string from environment variable
  const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;

  // If no connection string is provided, skip initialization (for local dev)
  if (!connectionString) {
    console.log('⚠️  Application Insights: No connection string provided. Skipping initialization.');
    console.log('   Set APPLICATIONINSIGHTS_CONNECTION_STRING to enable monitoring.');
    return;
  }

  try {
    // Setup Application Insights
    appInsights
      .setup(connectionString)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true) // Removed second parameter (extended metrics no longer supported)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true) // Simplified - removed second parameter that causes export errors
      .setUseDiskRetryCaching(true)
      .setSendLiveMetrics(true)
      .start();

    console.log('✅ Application Insights initialized successfully');
    isInitialized = true;
  } catch (error: any) {
    console.error('❌ Error initializing Application Insights:', error.message);
    // Don't throw - allow app to continue without monitoring
  }
}

/**
 * Track an exception (error)
 * Use this for logging errors
 */
export function trackException(error: Error, properties?: { [key: string]: string }): void {
  if (!isInitialized || !appInsights) return;

  try {
    const client = appInsights.defaultClient;
    if (client && typeof client.trackException === 'function') {
      client.trackException({
        exception: error,
        properties: properties || {},
      });
    }
  } catch (err) {
    // Fail silently - don't break app if logging fails
    console.error('Error tracking exception:', err);
  }
}

/**
 * Track a custom metric
 * Use this for tracking custom metrics (e.g., user count, course count)
 */
export function trackMetric(name: string, value: number, properties?: { [key: string]: string }): void {
  if (!isInitialized || !appInsights) return;

  try {
    const client = appInsights.defaultClient;
    if (client && typeof client.trackMetric === 'function') {
      client.trackMetric({
        name,
        value,
        properties: properties || {},
      });
    }
  } catch (err) {
    // Fail silently
    console.error('Error tracking metric:', err);
  }
}

/**
 * Track a custom event
 * Use this for tracking custom events (e.g., "UserLoggedIn", "CourseCreated")
 */
export function trackEvent(name: string, properties?: { [key: string]: string }, measurements?: { [key: string]: number }): void {
  if (!isInitialized || !appInsights) return;

  try {
    const client = appInsights.defaultClient;
    if (client && typeof client.trackEvent === 'function') {
      client.trackEvent({
        name,
        properties: properties || {},
        measurements: measurements || {},
      });
    }
  } catch (err) {
    // Fail silently
    console.error('Error tracking event:', err);
  }
}

/**
 * Track a dependency (e.g., Cosmos DB call, external API call)
 */
export function trackDependency(
  name: string,
  commandName: string,
  elapsed: number,
  success: boolean,
  dependencyTypeName: string = 'CosmosDB',
  properties?: { [key: string]: string }
): void {
  if (!isInitialized || !appInsights) return;

  try {
    const client = appInsights.defaultClient;
    if (client && typeof client.trackDependency === 'function') {
      client.trackDependency({
        name,
        commandName,
        elapsed,
        success,
        dependencyTypeName,
        properties: properties || {},
      });
    }
  } catch (err) {
    // Fail silently
    console.error('Error tracking dependency:', err);
  }
}

/**
 * Track a request (HTTP request)
 * Usually auto-collected, but can be used for custom tracking
 */
export function trackRequest(
  name: string,
  url: string,
  duration: number,
  success: boolean,
  resultCode: string | number,
  properties?: { [key: string]: string }
): void {
  if (!isInitialized || !appInsights) return;

  try {
    const client = appInsights.defaultClient;
    if (client && typeof client.trackRequest === 'function') {
      client.trackRequest({
        name,
        url,
        duration,
        success,
        resultCode,
        properties: properties || {},
      });
    }
  } catch (err) {
    // Fail silently
    console.error('Error tracking request:', err);
  }
}

/**
 * Set user context for telemetry
 * Useful for tracking user-specific events
 */
export function setUserContext(userId: string, accountId?: string, authenticatedUserId?: string): void {
  if (!isInitialized || !appInsights) return;

  try {
    const client = appInsights.defaultClient;
    if (client && client.context && client.context.keys) {
      client.context.keys.userId = userId;
      if (accountId) {
        client.context.keys.accountId = accountId;
      }
      if (authenticatedUserId) {
        client.context.keys.authenticatedUserId = authenticatedUserId;
      }
    }
  } catch (err) {
    // Fail silently
    console.error('Error setting user context:', err);
  }
}

/**
 * Set operation context (for correlation)
 */
export function setOperationContext(operationId: string, parentId?: string): void {
  if (!isInitialized || !appInsights) return;

  try {
    const client = appInsights.defaultClient;
    if (client && client.context && client.context.keys) {
      client.context.keys.operationId = operationId;
      if (parentId) {
        client.context.keys.operationParentId = parentId;
      }
    }
  } catch (err) {
    // Fail silently
    console.error('Error setting operation context:', err);
  }
}

