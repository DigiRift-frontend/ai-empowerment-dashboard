import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Allowed file types by upload type
const allowedTypesByCategory: Record<string, string[]> = {
  avatar: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  logo: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  manual: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  'schulung-material': [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'video/mp4',
    'video/webm',
    'application/zip',
  ],
}

// Max file sizes by upload type
const maxSizeByCategory: Record<string, number> = {
  avatar: 5 * 1024 * 1024, // 5MB
  logo: 5 * 1024 * 1024, // 5MB
  manual: 50 * 1024 * 1024, // 50MB for documents
  'schulung-material': 100 * 1024 * 1024, // 100MB for training materials
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string | null // 'avatar', 'logo', or 'manual'
    const moduleId = formData.get('moduleId') as string | null // For manuals

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Determine upload category
    const category = type === 'manual' ? 'manual' : type === 'avatar' ? 'avatar' : type === 'schulung-material' ? 'schulung-material' : 'logo'
    const allowedTypes = allowedTypesByCategory[category]
    const maxSize = maxSizeByCategory[category]

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      const allowedExt = category === 'manual' || category === 'schulung-material'
        ? 'PDF, Word, Excel, PowerPoint, Bilder, Videos, ZIP'
        : 'JPEG, PNG, GIF, WebP'
      return NextResponse.json({
        error: `Ungültiger Dateityp. Erlaubt: ${allowedExt}`
      }, { status: 400 })
    }

    // Validate file size
    if (file.size > maxSize) {
      const maxMB = Math.round(maxSize / 1024 / 1024)
      return NextResponse.json({
        error: `Datei zu groß. Maximum: ${maxMB}MB.`
      }, { status: 400 })
    }

    // Determine upload directory
    const uploadDir = category === 'manual' ? 'manuals' : category === 'avatar' ? 'avatars' : category === 'schulung-material' ? 'schulung-materials' : 'logos'
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', uploadDir)

    // Create directory if it doesn't exist
    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true })
    }

    // Generate unique filename (include moduleId for manuals)
    const ext = path.extname(file.name) || (category === 'manual' ? '.pdf' : '.jpg')
    const safeOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 50)
    const prefix = category === 'manual' && moduleId ? `${moduleId}_` : ''
    const filename = `${prefix}${Date.now()}-${Math.random().toString(36).substring(2, 9)}_${safeOriginalName}`
    const filepath = path.join(uploadPath, filename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Return the public URL
    const url = `/uploads/${uploadDir}/${filename}`

    return NextResponse.json({
      success: true,
      url,
      filename,
      originalName: file.name,
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
