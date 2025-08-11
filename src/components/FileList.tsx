'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileItem } from './FileItem'
import { FileInfo, FileListFilter, SortField, SortDirection } from '@/lib/types'
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

interface FileListProps {
  files: FileInfo[]
  isLoading: boolean
  error: string | null
  filter: FileListFilter
  onFilterChange: (filter: FileListFilter) => void
  onDeleteFile: (fileId: string) => void
}

export function FileList({
  files,
  isLoading,
  error,
  filter,
  onFilterChange,
  onDeleteFile
}: FileListProps) {
  const [searchTerm, setSearchTerm] = useState(filter.search || '')

  const handleSort = (field: SortField) => {
    let newDirection: SortDirection = 'asc'
    
    if (filter.sortBy === field) {
      if (filter.sortDirection === 'asc') {
        newDirection = 'desc'
      } else if (filter.sortDirection === 'desc') {
        newDirection = 'asc'
      }
    }
    
    onFilterChange({
      ...filter,
      sortBy: field,
      sortDirection: newDirection
    })
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    onFilterChange({
      ...filter,
      search: value || undefined
    })
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (filter.sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    
    return filter.sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>文件列表 ({files.length})</span>
        </CardTitle>
        
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="搜索文件..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 text-center text-muted-foreground">
            <p>加载中...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <p>暂无文件</p>
            {filter.search && (
              <p className="text-sm mt-1">
                找不到包含 &ldquo;{filter.search}&rdquo; 的文件
              </p>
            )}
          </div>
        ) : (
          <>
            {/* 表头 */}
            <div className="border-b bg-muted/30">
              <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-muted-foreground">
                <div className="col-span-4 flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('name')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    文件名
                    <SortIcon field="name" />
                  </Button>
                </div>
                <div className="col-span-1 flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('size')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    大小
                    <SortIcon field="size" />
                  </Button>
                </div>
                <div className="col-span-2 text-left">剩余时间</div>
                <div className="col-span-3 flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('uploadedAt')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    上传时间
                    <SortIcon field="uploadedAt" />
                  </Button>
                </div>
                <div className="col-span-2 text-right">操作</div>
              </div>
            </div>
            
            {/* 文件列表 */}
            <div className="divide-y">
              {files.map((file) => (
                <FileItem
                  key={file.id}
                  file={file}
                  onDelete={onDeleteFile}
                  onExpired={() => {
                    // 文件过期时可以选择自动刷新列表
                    console.log(`文件已过期: ${file.name}`)
                  }}
                />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}