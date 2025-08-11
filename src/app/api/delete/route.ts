import { NextRequest, NextResponse } from 'next/server'
import { blobService } from '@/lib/blob'

export async function DELETE(request: NextRequest) {
  try {
    const { fileId } = await request.json()

    if (!fileId) {
      return NextResponse.json(
        { error: '缺少 fileId 参数' },
        { status: 400 }
      )
    }

    await blobService.deleteFile(fileId)

    return NextResponse.json({
      success: true,
      message: '文件删除成功'
    })
  } catch (error) {
    console.error('删除文件失败:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '删除文件失败' 
      },
      { status: 500 }
    )
  }
}

// 清空整个空间的 API
export async function POST(request: NextRequest) {
  try {
    const { spaceId } = await request.json()

    if (!spaceId) {
      return NextResponse.json(
        { error: '缺少 spaceId 参数' },
        { status: 400 }
      )
    }

    await blobService.clearSpace(spaceId)

    return NextResponse.json({
      success: true,
      message: '空间清理成功'
    })
  } catch (error) {
    console.error('清理空间失败:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '清理空间失败' 
      },
      { status: 500 }
    )
  }
}