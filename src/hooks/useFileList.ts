import { useState, useEffect, useCallback } from 'react'
import { FileInfo, FileListFilter } from '@/lib/types'

export function useFileList(spaceId: string) {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FileListFilter>({})

  const fetchFiles = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/files?spaceId=${spaceId}`)
      
      if (!response.ok) {
        throw new Error('获取文件列表失败')
      }
      
      const data = await response.json()
      setFiles(data.files || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取文件列表失败')
    } finally {
      setIsLoading(false)
    }
  }, [spaceId])

  const deleteFile = useCallback(async (fileId: string) => {
    try {
      const response = await fetch('/api/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId })
      })

      if (!response.ok) {
        throw new Error('删除文件失败')
      }

      setFiles(prev => prev.filter(file => file.id !== fileId))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '删除文件失败')
    }
  }, [])

  const filteredFiles = files.filter(file => {
    if (filter.search) {
      const searchLower = filter.search.toLowerCase()
      return file.name.toLowerCase().includes(searchLower)
    }
    return true
  }).sort((a, b) => {
    if (!filter.sortBy) return 0

    let aValue: any = a[filter.sortBy]
    let bValue: any = b[filter.sortBy]

    if (filter.sortBy === 'uploadedAt') {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    }

    if (filter.sortDirection === 'desc') {
      return bValue > aValue ? 1 : -1
    } else {
      return aValue > bValue ? 1 : -1
    }
  })

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  return {
    files: filteredFiles,
    isLoading,
    error,
    filter,
    setFilter,
    refetch: fetchFiles,
    deleteFile
  }
}