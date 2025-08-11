'use client'

import { Card, CardContent } from '@/components/ui/card'
import { FileInfo } from '@/lib/types'
import { formatFileSize } from '@/lib/utils'
import { FolderOpen, Files, HardDrive, Clock } from 'lucide-react'

interface SpaceInfoProps {
  spaceId: string
  files: FileInfo[]
}

export function SpaceInfo({ spaceId, files }: SpaceInfoProps) {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  const lastModified = files.length > 0 
    ? new Date(Math.max(...files.map(f => new Date(f.uploadedAt).getTime())))
    : null

  return (
    <div className="mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 空间ID */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">空间ID</p>
                <p className="text-xs text-muted-foreground truncate" title={spaceId}>
                  {spaceId}
                </p>
              </div>
            </div>

            {/* 文件总数 */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Files className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium">文件总数</p>
                <p className="text-xs text-muted-foreground">
                  {files.length} 个文件
                </p>
              </div>
            </div>

            {/* 总存储大小 */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <HardDrive className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium">存储用量</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(totalSize)}
                </p>
              </div>
            </div>

            {/* 最后修改时间 */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium">最后更新</p>
                <p className="text-xs text-muted-foreground">
                  {lastModified 
                    ? new Intl.DateTimeFormat('zh-CN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }).format(lastModified)
                    : '暂无文件'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}