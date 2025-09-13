import { NextRequest, NextResponse } from 'next/server'
import { readFile, rm, stat } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { Uploader } from '@irys/upload'
import { Ethereum } from '@irys/upload-ethereum'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes for large file assembly

export async function POST(request: NextRequest) {
  let tempDir: string | null = null
  
  try {
    const { uploadId, chunks, originalName, originalSize } = await request.json()
    
    if (!uploadId || !chunks || !originalName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    console.log(`🔧 Assembling ${chunks.length} chunks for ${originalName}...`)
    
    // Read and combine all chunks
    tempDir = join(tmpdir(), 'irys-uploads', uploadId)
    const chunkBuffers: Buffer[] = []
    
    // Check if temp directory exists with detailed debugging
    try {
      const dirStats = await stat(tempDir)
      console.log(`📁 Temp directory exists: ${tempDir}`)
      console.log(`📊 Directory stats:`, { 
        isDirectory: dirStats.isDirectory(),
        size: dirStats.size,
        created: dirStats.birthtime,
        modified: dirStats.mtime
      })
      
      // List directory contents
      const { readdir } = await import('fs/promises')
      const files = await readdir(tempDir)
      console.log(`📋 Directory contents: [${files.join(', ')}]`)
      
      // Check each expected chunk file
      for (let i = 0; i < chunks.length; i++) {
        const chunkPath = join(tempDir, `chunk-${i}`)
        try {
          const chunkStats = await stat(chunkPath)
          console.log(`✅ Chunk ${i} exists: ${chunkStats.size} bytes`)
        } catch (chunkError) {
          console.error(`❌ Chunk ${i} missing: ${chunkPath}`)
          throw new Error(`Chunk ${i} not found at ${chunkPath}`)
        }
      }
      
    } catch (error) {
      console.error(`❌ Temp directory not found: ${tempDir}`)
      console.error(`❌ Error details:`, error)
      
      // Try to check parent directory
      const parentDir = join(tmpdir(), 'irys-uploads')
      try {
        await stat(parentDir)
        console.log(`📁 Parent directory exists: ${parentDir}`)
        const { readdir } = await import('fs/promises')
        const parentFiles = await readdir(parentDir)
        console.log(`📋 Parent directory contents: [${parentFiles.join(', ')}]`)
      } catch (parentError) {
        console.error(`❌ Parent directory also missing: ${parentDir}`, parentError)
      }
      
      throw new Error(`Upload chunks not found. Upload may have timed out. Directory: ${tempDir}`)
    }
    
    for (let i = 0; i < chunks.length; i++) {
      const chunkPath = join(tempDir, `chunk-${i}`)
      console.log(`📖 Reading chunk ${i + 1}/${chunks.length}: ${chunkPath}`)
      
      try {
        const chunkBuffer = await readFile(chunkPath)
        chunkBuffers.push(chunkBuffer)
        console.log(`✅ Chunk ${i + 1} read: ${chunkBuffer.length} bytes`)
      } catch (error) {
        console.error(`❌ Failed to read chunk ${i + 1}:`, error)
        throw new Error(`Failed to read chunk ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    // Combine all chunks into final buffer
    const finalBuffer = Buffer.concat(chunkBuffers)
    
    console.log(`📊 Assembled file: ${finalBuffer.length} bytes (expected: ${originalSize})`)
    
    if (finalBuffer.length !== parseInt(originalSize)) {
      throw new Error(`File size mismatch: assembled ${finalBuffer.length} bytes, expected ${originalSize}`)
    }
    
    // Check environment variables
    const privateKey = process.env.PRIVATE_KEY
    const sepoliaRpc = process.env.SEPOLIA_RPC
    
    if (!privateKey || !sepoliaRpc) {
      return NextResponse.json(
        { error: 'IRYS configuration missing' },
        { status: 500 }
      )
    }
    
    // Initialize Irys uploader
    const irysUploader = await Uploader(Ethereum)
      .withWallet(privateKey)
      .withRpc(sepoliaRpc)
      .devnet()
    
    // Check balance and price
    const price = await irysUploader.getPrice(finalBuffer.length)
    const balance = await irysUploader.getBalance()
    
    console.log(`💰 Balance: ${balance.toString()} wei, Cost: ${price.toString()} wei`)
    
    if (BigInt(balance.toString()) < BigInt(price.toString())) {
      return NextResponse.json(
        { error: `Insufficient balance. Need: ${price.toString()} wei, Have: ${balance.toString()} wei` },
        { status: 400 }
      )
    }
    
    // Determine content type
    const contentType = getContentType(originalName)
    
    // Upload to Irys
    console.log(`🚀 Uploading assembled ${originalName} to Irys...`)
    const receipt = await irysUploader.upload(finalBuffer, {
      tags: [
        { name: 'Content-Type', value: contentType },
        { name: 'Filename', value: originalName },
        { name: 'Original-Size', value: finalBuffer.length.toString() },
        { name: 'Upload-Timestamp', value: new Date().toISOString() },
        { name: 'Application', value: 'Antigua Tourism' },
        { name: 'Upload-Method', value: 'chunked' }
      ]
    })
    
    const irysUrl = `https://devnet.irys.xyz/${receipt.id}`
    
    console.log(`✅ Chunked upload successful: ${irysUrl}`)
    
    // Clean up temp files
    try {
      await rm(tempDir, { recursive: true, force: true })
      console.log(`🧹 Cleaned up temp directory: ${tempDir}`)
    } catch (cleanupError) {
      console.warn(`⚠️ Failed to clean up temp directory: ${cleanupError}`)
    }
    
    return NextResponse.json({
      success: true,
      url: irysUrl,
      id: receipt.id,
      arUrl: `ar://${receipt.id}`,
      size: finalBuffer.length,
      contentType: contentType,
      method: 'chunked'
    })
    
  } catch (error) {
    console.error('❌ Assembly and upload error:', error)
    
    // Clean up on error
    if (tempDir) {
      try {
        await rm(tempDir, { recursive: true, force: true })
      } catch (cleanupError) {
        console.warn(`⚠️ Failed to clean up temp directory on error: ${cleanupError}`)
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Assembly and upload failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// Enhanced content type detection
const getContentType = (filename: string): string => {
  const ext = filename.toLowerCase().split('.').pop()
  const contentTypes: { [key: string]: string } = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'bmp': 'image/bmp',
    'tiff': 'image/tiff',
    'ico': 'image/x-icon',
    
    // Videos
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'webm': 'video/webm',
    'mkv': 'video/x-matroska',
    'flv': 'video/x-flv',
    'wmv': 'video/x-ms-wmv',
    'm4v': 'video/x-m4v',
    '3gp': 'video/3gpp',
    
    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'flac': 'audio/flac',
    'm4a': 'audio/mp4',
    'aac': 'audio/aac',
    'ogg': 'audio/ogg',
    'wma': 'audio/x-ms-wma',
    
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain',
    
    // Default
    'default': 'application/octet-stream'
  }
  
  return contentTypes[ext || ''] || contentTypes['default']
}