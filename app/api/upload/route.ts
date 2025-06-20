import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.startsWith('audio/')) {
      return NextResponse.json({ error: 'File must be an audio file' }, { status: 400 })
    }

    // Upload to Vercel Blob
    const blob = await put(`music/${file.name}`, file, {
      access: 'public',
    })

    return NextResponse.json({ 
      message: 'File uploaded successfully',
      url: blob.url,
      pathname: blob.pathname
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}