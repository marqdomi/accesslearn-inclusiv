const API_BASE_URL = (() => {
  if (typeof window !== 'undefined') {
    const globalBase = (window as any)?.__API_BASE_URL__
    if (globalBase) {
      return String(globalBase).replace(/\/$/, '')
    }
  }

  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) {
    return String((import.meta as any).env.VITE_API_BASE_URL).replace(/\/$/, '')
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
    const apiPort = '4000'

    if (isLocalhost && port !== apiPort) {
      return `${protocol}//${hostname}:${apiPort}/api`
    }
  }

  return '/api'
})()

export interface RequestOptions extends RequestInit {
  body?: unknown
  allow404?: boolean
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { allow404 = false, body, headers, method, ...rest } = options
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  const url = `${API_BASE_URL}/${normalizedPath}`

  const init: RequestInit = {
    method: method ?? (body ? 'POST' : 'GET'),
    headers: {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string> | undefined)
    },
    ...rest
  }

  if (body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body)
  }

  const response = await fetch(url, init)

  if (allow404 && response.status === 404) {
    return undefined as T
  }

  if (response.status === 204) {
    return undefined as T
  }

  if (!response.ok) {
    let message = `Request to ${url} failed with status ${response.status}`

    try {
      const errorBody = await response.json()
      if (errorBody?.error) {
        message = Array.isArray(errorBody.error) ? errorBody.error.join(', ') : errorBody.error
      }
    } catch {
      // Ignore JSON parsing errors
    }

    throw new Error(message)
  }

  return response.json()
}

export { API_BASE_URL }
