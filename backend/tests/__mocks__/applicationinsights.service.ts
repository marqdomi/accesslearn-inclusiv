/**
 * Mock for Application Insights service
 */
export const initializeAppInsights = jest.fn()
export const trackException = jest.fn()
export const trackMetric = jest.fn()
export const trackEvent = jest.fn()
export const trackDependency = jest.fn()
export const trackRequest = jest.fn()
