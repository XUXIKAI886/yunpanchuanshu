'use client'

import { useCallback, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { UploadProgress } from '@/lib/types'

interface FileUploaderProps {
  onUpload: (files: File[]) => void
  uploads: UploadProgress[]
  isUploading: boolean
}

export function FileUploader({ onUpload, uploads, isUploading }: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      onUpload(files)
    }
  }, [onUpload])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onUpload(files)
      // 清空input，允许重复选择相同文件
      e.target.value = ''
    }
  }, [onUpload])

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* 文件拖放区域 */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">拖拽文件到此处或点击选择</p>
              <p className="text-sm text-muted-foreground">
                选择文件后将自动开始上传
              </p>
            </div>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
            />
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              选择文件
            </Button>
          </div>

          {/* 上传进度 */}
          {uploads.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">上传进度</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {uploads.map((upload) => (
                  <div key={upload.fileId} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {upload.status === 'completed' && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {upload.status === 'error' && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm font-medium truncate">
                          {upload.fileName}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {upload.status === 'completed' && '完成'}
                        {upload.status === 'uploading' && `${upload.progress}%`}
                        {upload.status === 'error' && '失败'}
                      </span>
                    </div>
                    {upload.status === 'uploading' && (
                      <Progress value={upload.progress} className="h-2" />
                    )}
                    {upload.status === 'error' && upload.error && (
                      <p className="text-xs text-red-500">{upload.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}