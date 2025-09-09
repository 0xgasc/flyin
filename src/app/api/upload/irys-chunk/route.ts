import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const chunk = formData.get('chunk') as File
    const uploadId = formData.get('uploadId') as string
    const chunkIndex = formData.get('chunkIndex') as string
    const totalChunks = formData.get('totalChunks') as string
    
    if (!chunk || !uploadId || !chunkIndex) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Create temp directory for this upload
    const tempDir = join(tmpdir(), 'irys-uploads', uploadId)
    await mkdir(tempDir, { recursive: true })
    
    // Save chunk to temp file
    const chunkPath = join(tempDir, `chunk-${chunkIndex}`)
    const chunkBuffer = Buffer.from(await chunk.arrayBuffer())
    await writeFile(chunkPath, chunkBuffer)
    
    console.log(`✅ Saved chunk ${parseInt(chunkIndex) + 1}/${totalChunks} for upload ${uploadId}`)
    
    return NextResponse.json({
      success: true,
      chunkId: `chunk-${chunkIndex}`,
      uploadId,
      chunkIndex: parseInt(chunkIndex),
      totalChunks: parseInt(totalChunks)
    })
    
  } catch (error) {
    console.error('❌ Chunk upload error:', error)
    return NextResponse.json(
      { 
        error: 'Chunk upload failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}