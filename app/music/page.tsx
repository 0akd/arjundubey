'use client'

import { useState, useEffect } from 'react'
import MusicPlayer from './comp'
import MusicUpload from './upcomp'

interface Track {
  id: string
  title: string
  artist: string
  url: string
  duration?: number
}

export default function MusicPage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    fetchTracks()
  }, [])

  const fetchTracks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tracks')
      if (!response.ok) {
        throw new Error('Failed to fetch tracks')
      }
      const data = await response.json()
      setTracks(data.tracks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadComplete = () => {
    fetchTracks() // Refresh the track list
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tracks...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={fetchTracks}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Music Player
          </h1>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            {showUpload ? 'Hide Upload' : 'Upload Music'}
          </button>
        </div>

        {showUpload && (
          <MusicUpload onUploadComplete={handleUploadComplete} />
        )}

        <MusicPlayer tracks={tracks} />
      </div>
    </div>
  )
}