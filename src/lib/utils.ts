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
         window.__TAURI__.core !== undefined &&
         window.__TAURI__.core.invoke !== undefined
}

/**
 * 获取 Tauri 环境信息（调试用）
 */
export function getTauriInfo(): {
  hasTauri: boolean
  hasCore: boolean
  hasInvoke: boolean
  availableApis: string[]
} {
  if (typeof window === 'undefined') {
    return {
      hasTauri: false,
      hasCore: false,
      hasInvoke: false,
      availableApis: []
    }
  }

  const hasTauri = !!window.__TAURI__
  const hasCore = !!(window.__TAURI__?.core)
  const hasInvoke = !!(window.__TAURI__?.core?.invoke)
  const availableApis = hasTauri ? Object.keys(window.__TAURI__ || {}) : []

  return {
    hasTauri,
    hasCore,
    hasInvoke,
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
 * 由于没有可用的 dialog 和 fs API，使用替代方案
 */
async function downloadFileInTauri(url: string, fileName: string): Promise<boolean> {
  try {
    console.log('Tauri 环境检测到，但没有 dialog/fs API')
    console.log('可用的 Tauri APIs:', Object.keys(window.__TAURI__ || {}))
    
    // 方案1：尝试使用 shell.open 在默认浏览器中打开下载链接
    if (window.__TAURI__?.core?.invoke) {
      try {
        console.log('尝试使用 shell.open 打开下载链接...')
        
        // 尝试不同的命令名称
        const possibleCommands = ['open_url', 'shell_open', 'open_path', 'open']
        
        for (const command of possibleCommands) {
          try {
            await window.__TAURI__.core.invoke(command, { url: url })
            console.log(`成功使用 ${command} 命令打开下载链接`)
            return true
          } catch (cmdError) {
            console.log(`命令 ${command} 失败:`, cmdError)
          }
        }
        
      } catch (shellError) {
        console.warn('所有 shell 命令都失败:', shellError)
      }
    }
    
    // 方案2：创建一个更用户友好的下载提示
    console.log('尝试在 Tauri WebView 中提供下载选项...')
    
    // 显示自定义下载对话框
    const userChoice = await showTauriDownloadDialog(fileName, url)
    
    if (userChoice === 'copy_url') {
      // 复制下载链接到剪贴板
      try {
        await navigator.clipboard.writeText(url)
        alert(`文件下载链接已复制到剪贴板！\n\n文件名: ${fileName}\n\n请在浏览器中粘贴链接进行下载。`)
        return true
      } catch (clipboardError) {
        console.warn('复制到剪贴板失败:', clipboardError)
      }
    }
    
    // 方案3：标准 WebView 下载（可能会被阻止，但值得尝试）
    console.log('尝试在 Tauri WebView 中触发标准下载...')
    return downloadFileInBrowser(url, fileName)
    
  } catch (error) {
    console.error('Tauri 下载失败:', error)
    console.log('回退到浏览器下载模式...')
    // 如果所有方案都失败，回退到浏览器下载
    return downloadFileInBrowser(url, fileName)
  }
}

/**
 * 显示 Tauri 环境下的下载选择对话框
 */
async function showTauriDownloadDialog(fileName: string, url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const dialog = document.createElement('div')
    dialog.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
    `
    
    const content = document.createElement('div')
    content.style.cssText = `
      background: white;
      padding: 24px;
      border-radius: 8px;
      max-width: 400px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    `
    
    content.innerHTML = `
      <h3 style="margin: 0 0 16px 0; color: #333;">文件下载</h3>
      <p style="margin: 0 0 16px 0; color: #666; line-height: 1.5;">
        在 Tauri 桌面应用中，无法直接下载文件。
        <br><br>
        <strong>文件名:</strong> ${fileName}
      </p>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <button id="copy-url" style="
          padding: 8px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        ">复制下载链接</button>
        <button id="cancel" style="
          padding: 8px 16px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        ">取消</button>
      </div>
    `
    
    dialog.appendChild(content)
    document.body.appendChild(dialog)
    
    const copyBtn = content.querySelector('#copy-url') as HTMLButtonElement
    const cancelBtn = content.querySelector('#cancel') as HTMLButtonElement
    
    copyBtn.onclick = () => {
      document.body.removeChild(dialog)
      resolve('copy_url')
    }
    
    cancelBtn.onclick = () => {
      document.body.removeChild(dialog)
      resolve(null)
    }
    
    // 点击外部关闭
    dialog.onclick = (e) => {
      if (e.target === dialog) {
        document.body.removeChild(dialog)
        resolve(null)
      }
    }
  })
}