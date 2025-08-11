import { NextRequest, NextResponse } from 'next/server'
import { blobService } from '@/lib/blob'

export async function POST(request: NextRequest) {
  try {
    const { spaceId } = await request.json().catch(() => ({}))

    const result = await blobService.cleanExpiredFiles(spaceId)

    return NextResponse.json({
      success: true,
      message: `已清理 ${result.deletedCount} 个过期文件`,
      deletedCount: result.deletedCount,
      deletedFiles: result.deletedFiles
    })
  } catch (error) {
    console.error('清理过期文件失败:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '清理过期文件失败' 
      },
      { status: 500 }
    )
  }
}

// 定时清理接口，可以通过 Vercel Cron Jobs 或外部服务调用
export async function GET(request: NextRequest) {
  try {
    // 验证请求来源（可选）
    const authHeader = request.headers.get('authorization')
    const expectedAuth = process.env.CLEANUP_AUTH_TOKEN
    
    if (expectedAuth && authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const result = await blobService.cleanExpiredFiles()

    return NextResponse.json({
      success: true,
      message: `定时清理完成，删除了 ${result.deletedCount} 个过期文件`,
      deletedCount: result.deletedCount,
      deletedFiles: result.deletedFiles,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('定时清理失败:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '定时清理失败' 
      },
      { status: 500 }
    )
  }
}