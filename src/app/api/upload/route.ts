import { NextRequest, NextResponse } from 'next/server'
import { blobService } from '@/lib/blob'
import { generateUniqueFileName } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const spaceId = formData.get('spaceId') as string

    if (!file || !spaceId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 文件大小限制 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: '文件大小不能超过 10MB' },
        { status: 400 }
      )
    }

    // 检查文件类型
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'text/plain', 'text/csv',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'video/mp4', 'video/avi', 'video/mov',
      'audio/mp3', 'audio/wav', 'audio/flac'
    ]

    if (!allowedTypes.includes(file.type) && file.type !== '') {
      return NextResponse.json(
        { error: '不支持的文件类型' },
        { status: 400 }
      )
    }

    // 获取现有文件列表，确保文件名唯一
    const existingFiles = await blobService.listFiles(spaceId)
    const existingNames = existingFiles.map(f => f.name)
    const uniqueFileName = generateUniqueFileName(file.name, existingNames)

    // 创建新的 File 对象（如果文件名被修改）
    let fileToUpload = file
    if (uniqueFileName !== file.name) {
      const buffer = await file.arrayBuffer()
      fileToUpload = new File([buffer], uniqueFileName, { type: file.type })
    }

    // 上传文件
    const fileInfo = await blobService.uploadFile(spaceId, fileToUpload)

    return NextResponse.json({
      success: true,
      file: fileInfo
    })
  } catch (error) {
    console.error('上传失败:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '上传失败' 
      },
      { status: 500 }
    )
  }
}