'use client'

import { useCallback, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import { UploadProgress } from '@/lib/types'
import { formatFileSize } from '@/lib/utils'

interface FileUploaderProps {
  onUpload: (files: File[]) => void
  uploads: UploadProgress[]
  isUploading: boolean
}

export function FileUploader({ onUpload, uploads, isUploading }: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    setSelectedFiles(files)
  }, [])

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
    setSelectedFiles(files)
  }, [])

  const handleUpload = useCallback(() => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles)
      setSelectedFiles([])
    }
  }, [selectedFiles, onUpload])

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0)

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
                支持多文件同时上传
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

          {/* 选中的文件列表 */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">待上传文件 ({selectedFiles.length})</h4>
                <p className="text-sm text-muted-foreground">
                  总大小: {formatFileSize(totalSize)}
                </p>
              </div>
              
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? '上传中...' : '开始上传'}
              </Button>
            </div>
          )}

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