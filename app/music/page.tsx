'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'

interface Track {
  id: string
  title: string
  artist: string
  url: string
  duration?: number
}

export default function MusicPage() {
  // All state hooks at the top
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(false)

  // All refs at the top
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  // Fetch tracks effect
  useEffect(() => {
    fetchTracks()
  }, [])

  // Audio event listeners effect
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleLoadStart = () => setIsLoadingPlayer(true)
    const handleCanPlay = () => setIsLoadingPlayer(false)
    const handleEnded = () => {
      if (currentTrack < tracks.length - 1) {
        setCurrentTrack(prev => prev + 1)
      } else {
        setIsPlaying(false)
        setCurrentTrack(0)
      }
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [currentTrack, tracks.length])

  // Volume effect
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  // Auto-play effect when track changes
  useEffect(() => {
    if (audioRef.current && tracks.length > 0 && isPlaying) {
      const playAudio = async () => {
        try {
          await audioRef.current?.play()
        } catch (error) {
          console.error('Error playing audio:', error)
          setIsPlaying(false)
          setIsLoadingPlayer(false)
        }
      }
      playAudio()
    }
  }, [currentTrack, tracks.length, isPlaying])

  const fetchTracks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tracks')
      if (!response.ok) throw new Error('Failed to fetch tracks')
      const data = await response.json()
      setTracks(data.tracks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const togglePlay = async () => {
    if (!audioRef.current) return
    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error('Error playing audio:', error)
      setIsLoadingPlayer(false)
    }
  }

  const nextTrack = () => {
    if (currentTrack < tracks.length - 1) {
      setCurrentTrack(prev => prev + 1)
      setIsPlaying(true)
    }
  }

  const prevTrack = () => {
    if (currentTrack > 0) {
      setCurrentTrack(prev => prev - 1)
      setIsPlaying(true)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressRef.current) return

    const rect = progressRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickRatio = clickX / rect.width
    const newTime = clickRatio * duration

    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleTrackSelect = (index: number) => {
    setCurrentTrack(index)
    setIsPlaying(true)
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={fetchTracks}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // No tracks state
  if (tracks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No tracks available</p>
        </div>
      </div>
    )
  }

  const track = tracks[currentTrack]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Music Player</h1>

        <div className="w-full max-w-md mx-auto bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-2xl text-white overflow-hidden">
          <audio
            ref={audioRef}
            src={track?.url}
            preload="metadata"
            onLoadStart={() => setIsLoadingPlayer(true)}
            onCanPlay={() => setIsLoadingPlayer(false)}
          />

          <div className="p-6 text-center">
            <div className="w-32 h-32 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/30">
              <div className="w-24 h-24 bg-white/30 rounded-full flex items-center justify-center transition-all duration-300">
                <Volume2 size={32} className={`transition-all duration-300 ${isPlaying ? 'scale-110' : ''}`} />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-1 truncate">{track?.title}</h2>
            <p className="text-white/80 truncate">{track?.artist}</p>
          </div>

          <div className="px-6 pb-4">
            <div
              ref={progressRef}
              className="w-full h-2 bg-white/20 rounded-full cursor-pointer mb-2 hover:h-3 transition-all duration-200"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-white rounded-full transition-all duration-100 shadow-sm"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-white/80">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 p-6">
            <button
              onClick={prevTrack}
              disabled={currentTrack === 0}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
            >
              <SkipBack size={20} />
            </button>

            <button
              onClick={togglePlay}
              disabled={isLoadingPlayer}
              className="p-4 rounded-full bg-white text-purple-600 hover:bg-white/90 disabled:opacity-50 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              {isLoadingPlayer ? (
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause size={24} />
              ) : (
                <Play size={24} className="ml-1" />
              )}
            </button>

            <button
              onClick={nextTrack}
              disabled={currentTrack === tracks.length - 1}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
            >
              <SkipForward size={20} />
            </button>
          </div>

          <div className="px-6 pb-6">
            <div className="flex items-center gap-3">
              <Volume2 size={16} className="text-white/60" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-white/20 rounded-full appearance-none cursor-pointer slider transition-all duration-200 hover:h-3"
              />
            </div>
          </div>

          {tracks.length > 1 && (
            <div className="border-t border-white/20">
              <div className="max-h-40 overflow-y-auto">
                {tracks.map((t, index) => (
                  <button
                    key={t.id}
                    onClick={() => handleTrackSelect(index)}
                    className={`w-full p-3 text-left hover:bg-white/10 transition-all duration-200 ${
                      index === currentTrack ? 'bg-white/20' : ''
                    } border-b border-white/10 last:border-b-0`}
                  >
                    <div className="truncate font-medium flex items-center">
                      {index === currentTrack && isPlaying && (
                        <div className="w-3 h-3 mr-2 flex items-center justify-center">
                          <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                        </div>
                      )}
                      {t.title}
                    </div>
                    <div className="truncate text-sm text-white/60">{t.artist}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <style jsx>{`
            .slider::-webkit-slider-thumb {
              appearance: none;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: white;
              cursor: pointer;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              transition: all 0.2s ease;
            }
            .slider::-webkit-slider-thumb:hover {
              transform: scale(1.1);
              box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            }
            .slider::-moz-range-thumb {
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: white;
              cursor: pointer;
              border: none;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              transition: all 0.2s ease;
            }
            .slider::-moz-range-thumb:hover {
              transform: scale(1.1);
              box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            }
          `}</style>
        </div>
      </div>
    </div>
  )
}