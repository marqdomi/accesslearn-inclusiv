/**
 * KV Service Polyfill
 * 
 * Provides fallback for BASE_KV_SERVICE_URL when not in GitHub Spark environment
 * This prevents ReferenceError when useKV hooks are used
 */

// Define BASE_KV_SERVICE_URL immediately (before any modules load)
// This must be done at the top level, not in a function
try {
  // Use Object.defineProperty to make it non-configurable (like a const)
  if (typeof (globalThis as any).BASE_KV_SERVICE_URL === 'undefined') {
    Object.defineProperty(globalThis, 'BASE_KV_SERVICE_URL', {
      value: '',
      writable: false,
      configurable: false,
    })
  }
  
  if (typeof (window as any).BASE_KV_SERVICE_URL === 'undefined') {
    Object.defineProperty(window, 'BASE_KV_SERVICE_URL', {
      value: '',
      writable: false,
      configurable: false,
    })
  }
} catch (e) {
  // Fallback if defineProperty fails
  (globalThis as any).BASE_KV_SERVICE_URL = ''
  ;(window as any).BASE_KV_SERVICE_URL = ''
}

// Suppress console warnings from KV service when using localStorage fallback
const originalWarn = console.warn
const originalError = console.error

console.warn = (...args: any[]) => {
  const message = args[0]?.toString?.() || ''
  // Filter out KV service warnings
  if (message.includes('BASE_KV_SERVICE_URL') || 
      message.includes('KV storage not available') ||
      message.includes('GitHub Spark KV storage')) {
    return // Suppress these warnings
  }
  originalWarn.apply(console, args)
}

console.error = (...args: any[]) => {
  const message = args[0]?.toString?.() || ''
  // Filter out KV service errors about BASE_KV_SERVICE_URL
  if (message.includes('BASE_KV_SERVICE_URL is not defined') ||
      message.includes('ReferenceError: BASE_KV_SERVICE_URL')) {
    return // Suppress these errors
  }
  originalError.apply(console, args)
}

export {}

