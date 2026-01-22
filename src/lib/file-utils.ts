/**
 * File utility functions for handling uploaded files
 */

import { 
  File as FileIcon, 
  FilePdf, 
  FileDoc, 
  FileXls, 
  FilePpt, 
  FileZip, 
  FileTxt,
} from '@phosphor-icons/react'
import type { IconProps } from '@phosphor-icons/react'
import type { ComponentType } from 'react'

/**
 * Get the appropriate file icon based on the file MIME type
 * @param fileType - The MIME type of the file
 * @returns The appropriate Phosphor icon component
 */
export const getFileTypeIcon = (fileType?: string): ComponentType<IconProps> => {
  if (!fileType) return FileIcon
  if (fileType.includes('pdf')) return FilePdf
  if (fileType.includes('word') || fileType.includes('doc')) return FileDoc
  if (fileType.includes('excel') || fileType.includes('spreadsheet') || fileType.includes('xls')) return FileXls
  if (fileType.includes('powerpoint') || fileType.includes('presentation') || fileType.includes('ppt')) return FilePpt
  if (fileType.includes('zip') || fileType.includes('compressed')) return FileZip
  if (fileType.includes('text') || fileType.includes('txt') || fileType.includes('csv')) return FileTxt
  return FileIcon
}

/**
 * Format file size in bytes to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted string like "1.5 MB"
 */
export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Check if a file type can be previewed in the browser
 * Currently supports PDF files only as they can be rendered by most browsers
 * @param fileType - The MIME type of the file
 * @returns Boolean indicating if the file can be previewed
 */
export const canPreviewFile = (fileType?: string): boolean => {
  if (!fileType) return false
  // Only PDF files can be reliably previewed in most browsers
  // Note: Images could be added but they're typically rendered inline in lessons
  return fileType.includes('pdf')
}

/**
 * Allowed file extensions for lesson file uploads
 */
export const ALLOWED_FILE_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', 
  '.ppt', '.pptx', '.txt', '.csv', '.zip'
]

/**
 * Maximum file size for lesson file uploads (in bytes)
 */
export const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
