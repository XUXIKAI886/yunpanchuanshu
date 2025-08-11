import { NextRequest, NextResponse } from 'next/server'
import { blobService } from '@/lib/blob'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const spaceId = searchParams.get('spaceId')

    if (!spaceId) {
      return NextResponse.json(
        { error: '缺少 spaceId 参数' },
        { status: 400 }
      )
    }

    const files = await blobService.listFiles(spaceId)
    const spaceStats = await blobService.getSpaceStats(spaceId)

    return NextResponse.json({
      success: true,
      files,
      spaceStats
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