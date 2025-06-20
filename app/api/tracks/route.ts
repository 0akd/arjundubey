import { NextResponse } from 'next/server'
import { list } from '@vercel/blob'

export async function GET() {
  try {
    // List all blobs in the 'music/' folder
    const { blobs } = await list({
      prefix: 'music/',
    })

    // Filter for .mp3 and .m4a files and format for the music player
    const tracks = blobs
      .filter(blob =>
        blob.pathname.endsWith('.mp3') || blob.pathname.endsWith('.m4a') || blob.pathname.endsWith('.opus')
      )
      .map(blob => {
        const filename = blob.pathname.split('/').pop() || ''
        const title = filename
          .replace(/\.(mp3|m4a)$/i, '')
          .replace(/[-_]/g, ' ')

        return {
          id: blob.pathname,
          title,
          artist: 'Unknown Artist',
          url: blob.url,
        }
      })
      .sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }))

    return NextResponse.json({ tracks })
  } catch (error) {
    console.error('Error fetching tracks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tracks' },
      { status: 500 }
    )
  }
}
