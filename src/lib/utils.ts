import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function getFileIcon(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'pdf':
      return '📄'
    case 'doc':
    case 'docx':
      return '📝'
    case 'xls':
    case 'xlsx':
      return '📊'
    case 'ppt':
    case 'pptx':
      return '📽️'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return '🖼️'
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
      return '🎥'
    case 'mp3':
    case 'wav':
    case 'flac':
      return '🎵'
    case 'zip':
    case 'rar':
    case '7z':
      return '🗂️'
    case 'txt':
      return '📄'
    default:
      return '📁'
  }
}

export function sanitizeFileName(fileName: string): string {
  // 移除或替换不安全的字符
  return fileName.replace(/[^a-zA-Z0-9._\u4e00-\u9fa5-]/g, '_')
}

export function generateUniqueFileName(originalName: string, existingNames: string[]): string {
  let fileName = sanitizeFileName(originalName)
  let counter = 1
  
  const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, '')
  const extension = fileName.includes('.') ? fileName.split('.').pop() : ''
  
  while (existingNames.includes(fileName)) {
    if (extension) {
      fileName = `${nameWithoutExtension}_${counter}.${extension}`
    } else {
      fileName = `${nameWithoutExtension}_${counter}`
    }
    counter++
  }
  
  return fileName
}

export function calculateTimeRemaining(expiresAt: Date): { 
  timeRemaining: string; 
  isExpired: boolean;
  totalMinutes: number;
} {
  const now = new Date()
  const expiry = new Date(expiresAt)
  const diffMs = expiry.getTime() - now.getTime()
  
  if (diffMs <= 0) {
    return { timeRemaining: '已过期', isExpired: true, totalMinutes: 0 }
  }
  
  const totalMinutes = Math.floor(diffMs / (1000 * 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  
  if (hours > 0) {
    return { 
      timeRemaining: `${hours}小时${minutes}分钟`, 
      isExpired: false,
      totalMinutes 
    }
  } else {
    return { 
      timeRemaining: `${minutes}分钟`, 
      isExpired: false,
      totalMinutes 
    }
  }
}

export function getExpiryDate(): Date {
  const now = new Date()
  return new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24小时后
}