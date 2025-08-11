'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileInfo } from '@/lib/types'
import { formatFileSize, formatDate, getFileIcon } from '@/lib/utils'
import { Download, Trash2 } from 'lucide-react'

interface FileItemProps {
  file: FileInfo
  onDelete: (fileId: string) => void
}

export function FileItem({ file, onDelete }: FileItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = file.downloadUrl
    link.download = file.name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
    <div className="grid grid-cols-12 gap-4 p-4 hover:bg-muted/50 transition-colors">
      {/* 文件名 */}
      <div className="col-span-5 flex items-center space-x-3 min-w-0">
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
      <div className="col-span-2 flex items-center">
        <span className="text-sm text-muted-foreground">
          {formatFileSize(file.size)}
        </span>
      </div>

      {/* 上传时间 */}
      <div className="col-span-3 flex items-center">
        <span className="text-sm text-muted-foreground">
          {formatDate(new Date(file.uploadedAt))}
        </span>
      </div>

      {/* 操作按钮 */}
      <div className="col-span-2 flex items-center justify-end space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          className="h-8 w-8 p-0"
          title="下载文件"
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