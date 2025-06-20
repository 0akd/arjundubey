import { NextResponse } from 'next/server'
import { list } from '@vercel/blob'

export async function GET() {
  try {
    // List all blobs with .mp3 extension
    const { blobs } = await list({
      prefix: 'music/', // Optional: organize files in a music folder
    })

    // Filter for MP3 files and format for the music player
    const tracks = blobs
      .filter(blob => blob.pathname.endsWith('.mp3'))
      .map((blob, index) => {
        // Extract filename without extension for title
        const filename = blob.pathname.split('/').pop() || ''
        const title = filename.replace('.mp3', '').replace(/[-_]/g, ' ')
        
        return {
          id: blob.pathname,
          title: title,
          artist: 'Unknown Artist', // You can parse this from filename or metadata
          url: blob.url,
        }
      })

    return NextResponse.json({ tracks })
  } catch (error) {
    console.error('Error fetching tracks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tracks' },
      { status: 500 }
    )
  }
}