/**
 * useSasUrl Hook
 * 
 * Manages Azure Blob Storage SAS URLs that expire after 60 minutes.
 * Automatically detects expired URLs and refreshes them via the API.
 * 
 * Usage:
 *   const { url, isRefreshing } = useSasUrl(originalUrl)
 *   <img src={url} />
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { ApiService } from '@/services/api.service'

// SAS URL pattern: contains "sig=" and "se=" (signature and expiry)
const SAS_URL_PATTERN = /[?&](sig|sv|se)=/

// Extract container and blob path from a SAS URL
// Format: https://<account>.blob.core.windows.net/<container>/<blobPath>?<sasParams>
function parseBlobUrl(sasUrl: string): { container: string; blobPath: string } | null {
  try {
    const url = new URL(sasUrl)
    const pathParts = url.pathname.split('/').filter(Boolean)
    if (pathParts.length < 2) return null
    
    const container = pathParts[0]
    const blobPath = pathParts.slice(1).join('/')
    
    return { container, blobPath }
  } catch {
    return null
  }
}

// Check if a SAS URL is expired based on the 'se' (SignedExpiry) parameter
function isSasUrlExpired(sasUrl: string): boolean {
  try {
    const url = new URL(sasUrl)
    const expiry = url.searchParams.get('se')
    if (!expiry) return false
    
    const expiryDate = new Date(expiry)
    // Consider expired if less than 5 minutes remaining (buffer)
    const bufferMs = 5 * 60 * 1000
    return (expiryDate.getTime() - bufferMs) < Date.now()
  } catch {
    return false
  }
}

/**
 * Hook to manage SAS URL lifecycle
 * @param originalUrl - The URL (may be SAS URL, regular URL, or blob path)
 * @param options - Configuration options
 * @returns Object with the current valid URL and refresh status
 */
export function useSasUrl(
  originalUrl: string | undefined | null,
  options: {
    /** Auto-refresh before expiry (default: true) */
    autoRefresh?: boolean
    /** Refresh interval check in ms (default: 5 minutes) */
    checkInterval?: number
  } = {}
) {
  const { autoRefresh = true, checkInterval = 5 * 60 * 1000 } = options
  const [url, setUrl] = useState<string | undefined>(originalUrl || undefined)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refreshUrl = useCallback(async () => {
    if (!originalUrl || !SAS_URL_PATTERN.test(originalUrl)) return
    
    const parsed = parseBlobUrl(originalUrl)
    if (!parsed) return
    
    setIsRefreshing(true)
    setError(null)
    
    try {
      const result = await ApiService.getMediaUrl(parsed.container, parsed.blobPath)
      setUrl(result.url)
    } catch (err: any) {
      console.warn('[useSasUrl] Failed to refresh SAS URL:', err.message)
      setError(err.message)
      // Keep the old URL as fallback
    } finally {
      setIsRefreshing(false)
    }
  }, [originalUrl])

  // Update URL when originalUrl changes
  useEffect(() => {
    if (!originalUrl) {
      setUrl(undefined)
      return
    }
    
    // If it's a SAS URL, check if expired
    if (SAS_URL_PATTERN.test(originalUrl) && isSasUrlExpired(originalUrl)) {
      refreshUrl()
    } else {
      setUrl(originalUrl)
    }
  }, [originalUrl, refreshUrl])

  // Set up periodic check for expiry
  useEffect(() => {
    if (!autoRefresh || !originalUrl || !SAS_URL_PATTERN.test(originalUrl)) return
    
    intervalRef.current = setInterval(() => {
      if (url && isSasUrlExpired(url)) {
        refreshUrl()
      }
    }, checkInterval)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoRefresh, checkInterval, url, originalUrl, refreshUrl])

  return { url, isRefreshing, error, refreshUrl }
}

/**
 * Utility to refresh a single SAS URL on-demand (non-hook version)
 */
export async function refreshSasUrl(sasUrl: string): Promise<string> {
  const parsed = parseBlobUrl(sasUrl)
  if (!parsed) return sasUrl
  
  try {
    const result = await ApiService.getMediaUrl(parsed.container, parsed.blobPath)
    return result.url
  } catch {
    return sasUrl // Fallback to original
  }
}
