import { Uploader } from '@irys/upload'
import { Ethereum } from '@irys/upload-ethereum'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const DOWNLOADS = '/Users/gs/Downloads'
const FILE_PATTERN = /^PHOTO-2026-02-/i
const privateKey = process.env.PRIVATE_KEY!
const sepoliaRpc = process.env.SEPOLIA_RPC!

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  const map: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
  }
  return map[ext] ?? 'image/jpeg'
}

async function uploadToIrys(filePath: string): Promise<string | null> {
  try {
    console.log(`📤 Uploading ${path.basename(filePath)}...`)
    const fileBuffer = fs.readFileSync(filePath)

    const irysUploader = await Uploader(Ethereum)
      .withWallet(privateKey)
      .withRpc(sepoliaRpc)
      .devnet()

    const receipt = await irysUploader.upload(fileBuffer, {
      tags: [
        { name: 'Content-Type', value: getContentType(filePath) },
        { name: 'Filename', value: path.basename(filePath) },
        { name: 'Application', value: 'FlyInGuate' },
        { name: 'Section', value: 'hero-carousel' },
      ],
    })

    const url = `https://devnet.irys.xyz/${receipt.id}`
    console.log(`✅ ${url}`)
    return url
  } catch (error) {
    console.error(`❌ Failed to upload ${path.basename(filePath)}:`, error)
    return null
  }
}

async function main() {
  const files = fs.readdirSync(DOWNLOADS)
    .filter(f => FILE_PATTERN.test(f) && /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort()
    .map(f => path.join(DOWNLOADS, f))

  if (files.length === 0) {
    console.error('No matching files found in', DOWNLOADS)
    process.exit(1)
  }

  console.log(`Found ${files.length} hero image(s) to upload:\n`)
  files.forEach(f => console.log(' -', path.basename(f)))
  console.log()

  const urls: string[] = []
  for (const filePath of files) {
    const url = await uploadToIrys(filePath)
    if (url) urls.push(url)
  }

  console.log('\n✨ Upload complete! Copy these URLs into page.tsx (HERO_IMAGES):')
  console.log(JSON.stringify(urls, null, 2))
}

main().catch(console.error)
