// components/MusicUpload.tsx
'use client'

import { useState, useRef } from 'react'
import { Upload, X, Music } from 'lucide-react'

interface UploadComponentProps {
  onUploadComplete?: () => void
}

export default function MusicUpload({ onUploadComplete }: UploadComponentProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    const newUploadedFiles: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        if (!file.type.startsWith('audio/')) {
          alert(`${file.name} is not an audio file`)
          continue
        }

        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const result = await response.json()
          newUploadedFiles.push(file.name)
        } else {
          const error = await response.json()
          alert(`Failed to upload ${file.name}: ${error.error}`)
        }
      }

      setUploadedFiles(prev => [...prev, ...newUploadedFiles])
      
      if (newUploadedFiles.length > 0) {
        onUploadComplete?.()
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300 hover:border-purple-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <div className="mb-4">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Upload Music Files
        </h3>
        
        <p className="text-sm text-gray-500 mb-4">
          Drag and drop your audio files here, or click to browse
        </p>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Choose Files'}
        </button>
        
        <p className="text-xs text-gray-400 mt-2">
          Supports MP3, WAV, OGG, and other audio formats
        </p>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-sm text-blue-700">Uploading files...</span>
          </div>
        </div>
      )}

      {/* Recently Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center">
            <Music className="h-4 w-4 mr-2" />
            Recently Uploaded
          </h4>
          <ul className="space-y-1">
            {uploadedFiles.map((filename, index) => (
              <li key={index} className="text-sm text-green-700 flex items-center justify-between">
                <span className="truncate">{filename}</span>
                <button
                  onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Updated Music Page with Upload: app/music/page.tsx
