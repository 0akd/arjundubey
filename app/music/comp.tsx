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

interface MusicPlayerProps {
  tracks: Track[]
}

export default function MusicPlayer({ tracks }: MusicPlayerProps) {
  const [currentTrack, setCurrentTrack] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

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
      setIsLoading(false)
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
    const width = rect.width
    const clickRatio = clickX / width
    const newTime = clickRatio * duration
    
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (tracks.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <p className="text-center text-gray-500">No tracks available</p>
      </div>
    )
  }

  const track = tracks[currentTrack]

  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-2xl text-white overflow-hidden">
      <audio
        ref={audioRef}
        src={track.url}
        preload="metadata"
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
      />
      
      {/* Track Info */}
      <div className="p-6 text-center">
        <div className="w-32 h-32 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
          <div className="w-24 h-24 bg-white/30 rounded-full flex items-center justify-center">
            <Volume2 size={32} />
          </div>
        </div>
        <h2 className="text-xl font-bold mb-1 truncate">{track.title}</h2>
        <p className="text-white/80 truncate">{track.artist}</p>
      </div>

      {/* Progress Bar */}
      <div className="px-6 pb-4">
        <div
          ref={progressRef}
          className="w-full h-2 bg-white/20 rounded-full cursor-pointer mb-2"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-white rounded-full transition-all duration-100"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-white/80">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 p-6">
        <button
          onClick={prevTrack}
          disabled={currentTrack === 0}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <SkipBack size={20} />
        </button>
        
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="p-4 rounded-full bg-white text-purple-600 hover:bg-white/90 disabled:opacity-50 transition-all"
        >
          {isLoading ? (
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
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <SkipForward size={20} />
        </button>
      </div>

      {/* Volume Control */}
      <div className="px-6 pb-6">
        <div className="flex items-center gap-3">
          <Volume2 size={16} className="text-white/60" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-white/20 rounded-full appearance-none cursor-pointer slider"
          />
        </div>
      </div>

      {/* Track List */}
      {tracks.length > 1 && (
        <div className="border-t border-white/20">
          <div className="max-h-40 overflow-y-auto">
            {tracks.map((t, index) => (
              <button
                key={t.id}
                onClick={() => {
                  setCurrentTrack(index)
                  setIsPlaying(true)
                }}
                className={`w-full p-3 text-left hover:bg-white/10 transition-colors ${
                  index === currentTrack ? 'bg-white/20' : ''
                }`}
              >
                <div className="truncate font-medium">{t.title}</div>
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
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  )
}