'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileInfo } from '@/lib/types'
import { formatFileSize, formatDate, getFileIcon, calculateTimeRemaining, getTauriInfo } from '@/lib/utils'
import { Download, Trash2 } from 'lucide-react'
import { CountdownTimer } from './CountdownTimer'
import { useFileDownload } from '@/hooks/useFileDownload'

interface FileItemProps {
  file: FileInfo
  onDelete: (fileId: string) => void
  onExpired?: (fileId: string) => void
}

export function FileItem({ file, onDelete, onExpired }: FileItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExpired, setIsExpired] = useState(false)
  const { downloadFileById, isDownloading, isTauri } = useFileDownload()
  
  const handleExpired = () => {
    setIsExpired(true)
    onExpired?.(file.id)
  }

  const handleDownload = async () => {
    if (isDownloading(file.id) || isExpired) return
    
    // 输出调试信息
    const tauriInfo = getTauriInfo()
    console.log('Tauri 环境信息:', tauriInfo)
    
    try {
      const success = await downloadFileById(file.id, file.name, file.downloadUrl)
      if (!success) {
        // 可以在这里添加错误提示
        console.error('文件下载失败')
      }
    } catch (error) {
      console.error('下载过程中发生错误:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`确定要删除文件 "${file.name}" 吗？`)) {
      return
    }

    setIsDeleting(true)
    try {
      await onDelete(file.id)
    } catch (error) {
      console.error('删除失败:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className={`grid grid-cols-12 gap-4 p-4 hover:bg-muted/50 transition-colors ${isExpired ? 'opacity-60' : ''}`}>
      {/* 文件名 */}
      <div className="col-span-4 flex items-center space-x-3 min-w-0">
        <span className="text-2xl flex-shrink-0">
          {getFileIcon(file.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate" title={file.name}>
            {file.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {file.type}
          </p>
        </div>
      </div>

      {/* 文件大小 */}
      <div className="col-span-1 flex items-center">
        <span className="text-sm text-muted-foreground">
          {formatFileSize(file.size)}
        </span>
      </div>

      {/* 倒计时 */}
      <div className="col-span-2 flex items-center">
        <CountdownTimer 
          expiresAt={file.expiresAt} 
          onExpired={handleExpired}
        />
      </div>

      {/* 上传时间 */}
      <div className="col-span-3 flex items-center">
        <div className="text-sm text-muted-foreground">
          <div>{formatDate(new Date(file.uploadedAt))}</div>
          <div className="text-xs">
            到期：{formatDate(new Date(file.expiresAt))}
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="col-span-2 flex items-center justify-end space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          disabled={isExpired || isDownloading(file.id)}
          className="h-8 w-8 p-0"
          title={isExpired ? '文件已过期' : isDownloading(file.id) ? `下载中...${isTauri ? '(Tauri模式)' : ''}` : `下载文件${isTauri ? '(Tauri模式)' : ''}`}
        >
          <Download className={`h-4 w-4 ${isDownloading(file.id) ? 'animate-spin' : ''}`} />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
          title="删除文件"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}