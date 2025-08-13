import { NextRequest, NextResponse } from 'next/server'
import { blobService } from '@/lib/blob'
import { GetObjectCommand } from '@aws-sdk/client-s3'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return NextResponse.json(
        { error: '缺少 fileId 参数' },
        { status: 400 }
      )
    }

    // 直接从R2获取文件流
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileId,
    })

    const s3Response = await blobService.client.send(command)
    
    if (!s3Response.Body) {
      throw new Error('文件不存在')
    }

    // 获取文件名
    const fileName = fileId.split('/').pop() || 'download'
    
    // 将流转换为 Uint8Array
    const chunks: Uint8Array[] = []
    const reader = s3Response.Body.transformToWebStream().getReader()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
    
    // 合并所有块
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const merged = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of chunks) {
      merged.set(chunk, offset)
      offset += chunk.length
    }

    // 返回文件流
    return new NextResponse(merged, {
      headers: {
        'Content-Type': s3Response.ContentType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Length': merged.length.toString(),
      },
    })
  } catch (error) {
    console.error('下载文件失败:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '下载文件失败' 
      },
      { status: 500 }
    )
  }
}