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

/**
 * 检测是否在 Tauri 环境中运行
 */
export function isTauriEnv(): boolean {
  return typeof window !== 'undefined' && 
         window.__TAURI__ !== undefined &&
         window.__TAURI__.dialog !== undefined &&
         window.__TAURI__.fs !== undefined
}

/**
 * 获取 Tauri 环境信息（调试用）
 */
export function getTauriInfo(): {
  hasTauri: boolean
  hasDialog: boolean
  hasFs: boolean
  availableApis: string[]
} {
  if (typeof window === 'undefined') {
    return {
      hasTauri: false,
      hasDialog: false,
      hasFs: false,
      availableApis: []
    }
  }

  const hasTauri = !!window.__TAURI__
  const hasDialog = !!(window.__TAURI__?.dialog)
  const hasFs = !!(window.__TAURI__?.fs)
  const availableApis = hasTauri ? Object.keys(window.__TAURI__ || {}) : []

  return {
    hasTauri,
    hasDialog,
    hasFs,
    availableApis
  }
}

/**
 * 兼容 Tauri 的文件下载功能
 * @param url 文件下载链接
 * @param fileName 文件名
 * @returns Promise<boolean> 下载是否成功
 */
export async function downloadFile(url: string, fileName: string): Promise<boolean> {
  if (!isTauriEnv()) {
    // 浏览器环境：使用传统的下载方法
    return downloadFileInBrowser(url, fileName)
  } else {
    // Tauri 环境：使用 Tauri API
    return downloadFileInTauri(url, fileName)
  }
}

/**
 * 浏览器环境下的文件下载
 */
function downloadFileInBrowser(url: string, fileName: string): boolean {
  try {
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    return true
  } catch (error) {
    console.error('浏览器下载失败:', error)
    return false
  }
}

/**
 * Tauri 环境下的文件下载
 */
async function downloadFileInTauri(url: string, fileName: string): Promise<boolean> {
  try {
    // 详细检查 Tauri API 是否可用
    if (typeof window === 'undefined') {
      throw new Error('Window 对象不可用')
    }
    
    if (!window.__TAURI__) {
      throw new Error('__TAURI__ 对象不存在')
    }
    
    if (!window.__TAURI__.dialog || !window.__TAURI__.dialog.save) {
      throw new Error('Tauri dialog API 不可用')
    }
    
    if (!window.__TAURI__.fs || !window.__TAURI__.fs.writeBinaryFile) {
      throw new Error('Tauri fs API 不可用')
    }

    console.log('Tauri APIs 可用，开始下载流程...')

    // 使用 Tauri API
    const save = window.__TAURI__.dialog.save
    const writeBinaryFile = window.__TAURI__.fs.writeBinaryFile
    
    // 获取文件扩展名用于文件类型过滤
    const extension = fileName.split('.').pop()?.toLowerCase()
    const filters = extension ? [{
      name: '文件',
      extensions: [extension]
    }] : []

    console.log('显示保存对话框...')
    
    // 显示保存对话框
    const filePath = await save({
      defaultPath: fileName,
      filters: filters
    })

    if (!filePath) {
      console.log('用户取消了保存')
      return false
    }

    console.log('用户选择保存路径:', filePath)
    console.log('开始下载文件内容...')

    // 下载文件内容
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`下载失败: ${response.statusText}`)
    }

    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    console.log('文件下载完成，大小:', uint8Array.length, '字节')
    console.log('开始写入文件...')

    // 写入文件
    await writeBinaryFile(filePath, uint8Array)
    
    console.log('文件保存成功!')
    return true
  } catch (error) {
    console.error('Tauri 下载失败:', error)
    console.log('回退到浏览器下载模式...')
    // 如果 Tauri API 不可用，回退到浏览器下载
    return downloadFileInBrowser(url, fileName)
  }
}