'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileInfo } from '@/lib/types'
import { formatFileSize, formatDate, getFileIcon, calculateTimeRemaining } from '@/lib/utils'
import { Download, Trash2 } from 'lucide-react'
import { CountdownTimer } from './CountdownTimer'

interface FileItemProps {
  file: FileInfo
  onDelete: (fileId: string) => void
  onExpired?: (fileId: string) => void
}

export function FileItem({ file, onDelete, onExpired }: FileItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExpired, setIsExpired] = useState(false)
  
  const handleExpired = () => {
    setIsExpired(true)
    onExpired?.(file.id)
  }

  const handleDownload = async () => {
    try {
      // 使用 fetch 获取文件内容，然后强制下载
      const response = await fetch(file.downloadUrl)
      if (!response.ok) {
        throw new Error('下载失败')
      }
      
      // 获取文件 blob
      const blob = await response.blob()
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file.name
      link.style.display = 'none'
      
      // 添加到页面并触发下载
      document.body.appendChild(link)
      link.click()
      
      // 清理
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('下载失败:', error)
      alert(`下载失败: ${error instanceof Error ? error.message : '未知错误'}`)
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
          disabled={isExpired}
          className="h-8 w-8 p-0"
          title={isExpired ? '文件已过期' : '下载文件'}
        >
          <Download className="h-4 w-4" />
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