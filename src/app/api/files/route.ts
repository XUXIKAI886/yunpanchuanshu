import { NextRequest, NextResponse } from 'next/server'
import { blobService } from '@/lib/blob'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const spaceId = searchParams.get('spaceId')
    const cleanup = searchParams.get('cleanup') === 'true'

    if (!spaceId) {
      return NextResponse.json(
        { error: '缺少 spaceId 参数' },
        { status: 400 }
      )
    }

    // 如果请求清理，先清理过期文件
    let cleanupResult
    if (cleanup) {
      try {
        cleanupResult = await blobService.cleanExpiredFiles(spaceId)
      } catch (error) {
        console.warn('清理过期文件时出错:', error)
      }
    }

    const files = await blobService.listFiles(spaceId)
    
    // 直接从文件列表计算统计信息，避免重复调用
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    const lastModified = files.length > 0 ? files[0].uploadedAt : new Date()
    
    const spaceStats = {
      id: spaceId,
      totalFiles: files.length,
      totalSize,
      lastModified,
    }

    return NextResponse.json({
      success: true,
      files,
      spaceStats,
      cleanupResult
    })
  } catch (error) {
    console.error('获取文件列表失败:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '获取文件列表失败' 
      },
      { status: 500 }
    )
  }
}