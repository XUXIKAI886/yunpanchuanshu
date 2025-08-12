import { 
  S3Client, 
  PutObjectCommand, 
  ListObjectsV2Command, 
  DeleteObjectCommand, 
  HeadObjectCommand,
  GetObjectCommand 
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { FileInfo } from './types'
import { getExpiryDate } from './utils'

export class R2Service {
  private client: S3Client
  private bucketName: string
  private publicDomain?: string

  constructor() {
    if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET_NAME) {
      throw new Error('R2配置不完整，请检查环境变量')
    }

    this.client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    })
    
    this.bucketName = process.env.R2_BUCKET_NAME
    this.publicDomain = process.env.R2_PUBLIC_DOMAIN
  }

  private getSpacePath(spaceId: string): string {
    return `spaces/${spaceId}`
  }

  private getFileKey(spaceId: string, fileName: string): string {
    const spacePath = this.getSpacePath(spaceId)
    return `${spacePath}/${fileName}`
  }

  // 生成预签名下载URL，默认1小时有效期
  private async generateDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const fileName = key.split('/').pop() || 'download'
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ResponseContentDisposition: `attachment; filename="${encodeURIComponent(fileName)}"`,
      })
      
      return await getSignedUrl(this.client, command, { expiresIn })
    } catch (error) {
      console.warn(`生成下载链接失败: ${key}`, error)
      // 如果预签名失败，返回一个占位符
      return `#download-error-${key}`
    }
  }

  async uploadFile(spaceId: string, file: File): Promise<FileInfo> {
    const fileName = file.name
    const fileKey = this.getFileKey(spaceId, fileName)
    
    try {
      const now = new Date()
      const expiresAt = getExpiryDate()
      
      // 将文件转换为 Buffer
      const buffer = Buffer.from(await file.arrayBuffer())
      
      // 添加元数据标记过期时间
      const metadata = {
        'uploaded-at': now.toISOString(),
        'expires-at': expiresAt.toISOString(),
        'space-id': spaceId,
      }

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: buffer,
        ContentType: file.type,
        Metadata: metadata,
      })

      const result = await this.client.send(command)
      
      // 使用公共 URL
      const downloadUrl = this.publicDomain 
        ? `https://${this.publicDomain}/${fileKey}`
        : `${process.env.R2_ENDPOINT}/${this.bucketName}/${fileKey}`

      return {
        id: fileKey, // 使用文件键作为ID
        name: fileName,
        size: file.size,
        type: file.type,
        uploadedAt: now,
        expiresAt,
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
      
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: spacePath + '/',
      })

      const result = await this.client.send(command)
      const files: FileInfo[] = []

      if (result.Contents) {
        for (const object of result.Contents) {
          if (!object.Key) continue
          
          try {
            // 获取文件详细信息
            const headCommand = new HeadObjectCommand({
              Bucket: this.bucketName,
              Key: object.Key,
            })
            
            const headResult = await this.client.send(headCommand)
            
            const fileName = object.Key.split('/').pop() || ''
            const uploadedAt = object.LastModified || new Date()
            
            // 从元数据读取过期时间，如果没有则使用默认24小时
            let expiresAt: Date
            if (headResult.Metadata && headResult.Metadata['expires-at']) {
              expiresAt = new Date(headResult.Metadata['expires-at'])
            } else {
              expiresAt = new Date(uploadedAt.getTime() + 24 * 60 * 60 * 1000)
            }

            // 使用公共 URL
            const downloadUrl = this.publicDomain 
              ? `https://${this.publicDomain}/${object.Key}`
              : `${process.env.R2_ENDPOINT}/${this.bucketName}/${object.Key}`

            files.push({
              id: object.Key,
              name: fileName,
              size: object.Size || 0,
              type: headResult.ContentType || 'application/octet-stream',
              uploadedAt,
              expiresAt,
              downloadUrl,
              spaceId,
            })
          } catch (error) {
            console.warn(`无法获取文件信息: ${object.Key}`, error)
          }
        }
      }

      return files.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
    } catch (error) {
      throw new Error(`获取文件列表失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  async deleteFile(fileKey: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      })

      await this.client.send(command)
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

  async cleanExpiredFiles(spaceId?: string): Promise<{ deletedCount: number; deletedFiles: string[] }> {
    try {
      let files: FileInfo[]
      
      if (spaceId) {
        files = await this.listFiles(spaceId)
      } else {
        // 获取所有空间的文件
        const command = new ListObjectsV2Command({
          Bucket: this.bucketName,
          Prefix: 'spaces/',
        })

        const result = await this.client.send(command)
        files = []

        if (result.Contents) {
          for (const object of result.Contents) {
            if (!object.Key) continue
            
            try {
              const headCommand = new HeadObjectCommand({
                Bucket: this.bucketName,
                Key: object.Key,
              })
              
              const headResult = await this.client.send(headCommand)
              const fileName = object.Key.split('/').pop() || ''
              const pathParts = object.Key.split('/')
              const extractedSpaceId = pathParts.length > 1 ? pathParts[1] : 'unknown'
              const uploadedAt = object.LastModified || new Date()
              
              let expiresAt: Date
              if (headResult.Metadata && headResult.Metadata['expires-at']) {
                expiresAt = new Date(headResult.Metadata['expires-at'])
              } else {
                expiresAt = new Date(uploadedAt.getTime() + 24 * 60 * 60 * 1000)
              }

              // 使用公共 URL
            const downloadUrl = this.publicDomain 
              ? `https://${this.publicDomain}/${object.Key}`
              : `${process.env.R2_ENDPOINT}/${this.bucketName}/${object.Key}`

              files.push({
                id: object.Key,
                name: fileName,
                size: object.Size || 0,
                type: headResult.ContentType || 'application/octet-stream',
                uploadedAt,
                expiresAt,
                downloadUrl,
                spaceId: extractedSpaceId,
              })
            } catch (error) {
              console.warn(`无法获取文件信息: ${object.Key}`, error)
            }
          }
        }
      }

      const now = new Date()
      const expiredFiles = files.filter(file => file.expiresAt.getTime() < now.getTime())
      
      const deletedFiles: string[] = []
      for (const file of expiredFiles) {
        try {
          await this.deleteFile(file.id)
          deletedFiles.push(file.name)
        } catch (error) {
          console.warn(`删除过期文件失败: ${file.name}`, error)
        }
      }

      return {
        deletedCount: deletedFiles.length,
        deletedFiles
      }
    } catch (error) {
      throw new Error(`清理过期文件失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 生成预签名的下载URL（用于私有文件访问）
  async generatePresignedDownloadUrl(fileKey: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      })
      
      return await getSignedUrl(this.client, command, { expiresIn })
    } catch (error) {
      throw new Error(`生成下载链接失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }
}

export const r2Service = new R2Service()