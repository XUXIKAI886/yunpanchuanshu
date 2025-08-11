'use client'

import { useState, useEffect } from 'react'
import { FileUploader } from '@/components/FileUploader'
import { FileList } from '@/components/FileList'
import { SpaceInfo } from '@/components/SpaceInfo'
import { useFileList } from '@/hooks/useFileList'
import { useFileUpload } from '@/hooks/useFileUpload'

interface PageProps {
  params: {
    spaceId: string
  }
}

export default function SpacePage({ params }: PageProps) {
  const { spaceId } = params
  const { files, isLoading, error, refetch, deleteFile, filter, setFilter } = useFileList(spaceId)
  const { uploads, isUploading, uploadFiles } = useFileUpload(spaceId)

  const handleUploadComplete = () => {
    refetch()
  }

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteFile(fileId)
    } catch (error) {
      alert(error instanceof Error ? error.message : '删除文件失败')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* 标题区域 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            呈尚策划 关键词描述文件上传下载系统
          </h1>
          <p className="text-muted-foreground">
            通过此链接可以上传和下载文件，文件将在24小时后自动删除
          </p>
        </div>

        {/* 空间信息 */}
        <SpaceInfo spaceId={spaceId} files={files} />

        {/* 文件上传区域 */}
        <div className="mb-8">
          <FileUploader
            onUpload={(files) => uploadFiles(files, handleUploadComplete)}
            uploads={uploads}
            isUploading={isUploading}
          />
        </div>

        {/* 文件列表 */}
        <FileList
          files={files}
          isLoading={isLoading}
          error={error}
          filter={filter}
          onFilterChange={setFilter}
          onDeleteFile={handleDeleteFile}
        />
      </div>
    </div>
  )
}