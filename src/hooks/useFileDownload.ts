'use client'

import { useState, useCallback } from 'react'
import { downloadFile, isTauriEnv } from '@/lib/utils'

interface UseFileDownloadReturn {
  downloadFileById: (fileId: string, fileName: string, downloadUrl: string) => Promise<boolean>
  isDownloading: (fileId: string) => boolean
  downloadProgress: Record<string, number>
  isTauri: boolean
}

/**
 * 文件下载 Hook，支持浏览器和 Tauri 环境
 */
export function useFileDownload(): UseFileDownloadReturn {
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set())
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({})
  const isTauri = isTauriEnv()

  const downloadFileById = useCallback(async (
    fileId: string,
    fileName: string,
    downloadUrl: string
  ): Promise<boolean> => {
    if (downloadingFiles.has(fileId)) {
      return false
    }

    setDownloadingFiles(prev => new Set(Array.from(prev).concat(fileId)))
    setDownloadProgress(prev => ({ ...prev, [fileId]: 0 }))

    try {
      const success = await downloadFile(downloadUrl, fileName)
      
      if (success) {
        setDownloadProgress(prev => ({ ...prev, [fileId]: 100 }))
      }
      
      return success
    } catch (error) {
      console.error('文件下载失败:', error)
      return false
    } finally {
      // 延迟清除状态，让用户能看到完成状态
      setTimeout(() => {
        setDownloadingFiles(prev => {
          const newSet = new Set(prev)
          newSet.delete(fileId)
          return newSet
        })
        setDownloadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[fileId]
          return newProgress
        })
      }, 1000)
    }
  }, [downloadingFiles])

  const isDownloading = useCallback((fileId: string): boolean => {
    return downloadingFiles.has(fileId)
  }, [downloadingFiles])

  return {
    downloadFileById,
    isDownloading,
    downloadProgress,
    isTauri
  }
}