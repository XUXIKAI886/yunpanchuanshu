import { put, del, list, head } from '@vercel/blob'
import { FileInfo } from './types'

export class BlobService {
  private getSpacePath(spaceId: string): string {
    return `spaces/${spaceId}`
  }

  async uploadFile(spaceId: string, file: File): Promise<FileInfo> {
    const spacePath = this.getSpacePath(spaceId)
    const fileName = file.name
    const filePath = `${spacePath}/${fileName}`

    try {
      const { url, downloadUrl } = await put(filePath, file, {
        access: 'public',
        addRandomSuffix: false,
      })

      return {
        id: url,
        name: fileName,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        downloadUrl,
        spaceId,
      }
    } catch (error) {
      throw new Error(`文件上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  async listFiles(spaceId: string): Promise<FileInfo[]> {
    try {
      const spacePath = this.getSpacePath(spaceId)
      const { blobs } = await list({
        prefix: spacePath,
      })

      const files: FileInfo[] = []

      for (const blob of blobs) {
        try {
          const fileName = blob.pathname.split('/').pop() || ''
          const fileInfo = await head(blob.url)
          
          files.push({
            id: blob.url,
            name: fileName,
            size: blob.size,
            type: fileInfo.contentType || 'application/octet-stream',
            uploadedAt: new Date(blob.uploadedAt),
            downloadUrl: blob.downloadUrl,
            spaceId,
          })
        } catch (error) {
          console.warn(`无法获取文件信息: ${blob.pathname}`, error)
        }
      }

      return files.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
    } catch (error) {
      throw new Error(`获取文件列表失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      await del(fileUrl)
    } catch (error) {
      throw new Error(`删除文件失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  async getSpaceStats(spaceId: string) {
    try {
      const files = await this.listFiles(spaceId)
      const totalSize = files.reduce((sum, file) => sum + file.size, 0)
      const lastModified = files.length > 0 ? files[0].uploadedAt : new Date()

      return {
        id: spaceId,
        totalFiles: files.length,
        totalSize,
        lastModified,
      }
    } catch (error) {
      return {
        id: spaceId,
        totalFiles: 0,
        totalSize: 0,
        lastModified: new Date(),
      }
    }
  }

  async clearSpace(spaceId: string): Promise<void> {
    try {
      const files = await this.listFiles(spaceId)
      
      await Promise.all(
        files.map(file => this.deleteFile(file.id))
      )
    } catch (error) {
      throw new Error(`清空空间失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }
}

export const blobService = new BlobService()