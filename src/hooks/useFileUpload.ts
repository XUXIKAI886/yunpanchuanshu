import { useState, useCallback } from 'react'
import { UploadProgress } from '@/lib/types'

export function useFileUpload(spaceId: string) {
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const uploadFiles = useCallback(async (files: File[], onComplete?: () => void) => {
    if (files.length === 0) return

    setIsUploading(true)
    
    const newUploads: UploadProgress[] = files.map(file => ({
      fileId: Math.random().toString(36),
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    }))
    
    setUploads(newUploads)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const uploadId = newUploads[i].fileId

        const formData = new FormData()
        formData.append('file', file)
        formData.append('spaceId', spaceId)

        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            throw new Error(`上传失败: ${response.statusText}`)
          }

          setUploads(prev => prev.map(upload => 
            upload.fileId === uploadId 
              ? { ...upload, progress: 100, status: 'completed' }
              : upload
          ))
        } catch (error) {
          setUploads(prev => prev.map(upload => 
            upload.fileId === uploadId 
              ? { 
                  ...upload, 
                  status: 'error', 
                  error: error instanceof Error ? error.message : '上传失败'
                }
              : upload
          ))
        }
      }
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploads([]), 3000) // 3秒后清除上传记录
      onComplete?.()
    }
  }, [spaceId])

  const clearUploads = useCallback(() => {
    setUploads([])
  }, [])

  return {
    uploads,
    isUploading,
    uploadFiles,
    clearUploads
  }
}