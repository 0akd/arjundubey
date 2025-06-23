'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'

interface Track {
  id: string
  title: string
  url: string
  coverImage: string
  duration?: number
}

// Local tracks array with music file links and Unsplash cover images
const LOCAL_TRACKS: Track[] = [

  {
    id: '2',
    title: 'Matushka',
    url: 'https://mkw3xpovahzkrpq2.public.blob.vercel-storage.com/music/%D0%9C%D0%B0%D1%82%D1%83%D1%88%D0%BA%D0%B0%5B1%5D-zb80yTlpQl4t7UnbKEIE2LRPPB0kzt.m4a',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop'
  },
  {
    id: '3',
    title: 'Slava funk slowed',
    url: 'https://mkw3xpovahzkrpq2.public.blob.vercel-storage.com/music/SLAVA.m4a',
    coverImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop'
  },
  {
    id: '4',
    title: 'Slava funk',
    url: 'https://mkw3xpovahzkrpq2.public.blob.vercel-storage.com/music/SLAVA%20FUNK%21.m4a',
    coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop'
  },
 
    {
    id: '1',
    title: 'Legends Never Die',
    url: 'https://mkw3xpovahzkrpq2.public.blob.vercel-storage.com/music/Legends_Never_Die-IOZ02emJv5ESaoi90EkeehmXy2w1Xk.m4a',
    coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop'
  },
   {
    id: '5',
    title: 'Goggins Speech',
    url: 'https://mkw3xpovahzkrpq2.public.blob.vercel-storage.com/music/z_large_file_size_pending_upload-xj4CiADvh07cbqspGj0h7au8K0ErJR.m4a',
    coverImage: 'https://images.unsplash.com/photo-1571974599782-87624638275e?w=400&h=400&fit=crop'
  },
]

export default function MusicPage() {
  const [tracks, setTracks] = useState<Track[]>(LOCAL_TRACKS)
  const [fetchingTracks, setFetchingTracks] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [audioLoading, setAudioLoading] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    
    const handleLoadStart = () => {
      console.log('Audio loadstart event')
      setAudioLoading(true)
      // Set a timeout to clear loading state if it takes too long
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
      loadingTimeoutRef.current = setTimeout(() => {
        console.log('Audio loading timeout - clearing loading state')
        setAudioLoading(false)
        setIsPlaying(false)
      }, 10000) // 10 second timeout
    }
    
    const handleCanPlay = () => {
      console.log('Audio canplay event')
      setAudioLoading(false)
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
    }
    
    const handleWaiting = () => {
      console.log('Audio waiting event')
      setAudioLoading(true)
    }
    
    const handlePlaying = () => {
      console.log('Audio playing event')
      setAudioLoading(false)
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
    }
    
    const handleError = () => {
      console.log('Audio error event')
      setAudioLoading(false)
      setIsPlaying(false)
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
      console.error('Audio error occurred')
    }
    
    const handleEnded = () => {
      setAudioLoading(false)
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
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('playing', handlePlaying)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('playing', handlePlaying)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [currentTrack, tracks.length])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  useEffect(() => {
    if (audioRef.current && tracks.length > 0 && isPlaying) {
      const playAudio = async () => {
        try {
          await audioRef.current?.play()
        } catch (error) {
          console.error('Error playing audio:', error)
          setIsPlaying(false)
          setAudioLoading(false)
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current)
            loadingTimeoutRef.current = null
          }
        }
      }
      playAudio()
    }
  }, [currentTrack, tracks.length, isPlaying])

  const togglePlay = async () => {
    if (!audioRef.current || tracks.length === 0) return
    
    console.log('togglePlay called', { 
      isPlaying, 
      currentTrack, 
      trackUrl: tracks[currentTrack]?.url,
      tracksCount: tracks.length 
    })
    
    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
        setAudioLoading(false)
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current)
          loadingTimeoutRef.current = null
        }
      } else {
        setIsPlaying(true)
        // Don't set loading here - let the audio events handle it
        console.log('Attempting to play audio...')
        await audioRef.current.play()
        console.log('Audio play() resolved')
      }
    } catch (error) {
      console.error('Error playing audio:', error)
      setAudioLoading(false)
      setIsPlaying(false)
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
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

  // Show player immediately since we have local tracks
  const showPlayer = true

  if (error && tracks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4 text-lg">Error: {error}</p>
          <button
            onClick={() => setTracks(LOCAL_TRACKS)}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const track = tracks[currentTrack]
  const hasValidTrack = track && track.url

  return (
    <div className=" p-4">
      <div className="max-w-sm lg:max-w-4xl mx-auto">
        <div className="lg:grid lg:grid-cols-3 lg:gap-6 lg:items-start">
          {/* Player Section */}
          <div className="lg:col-span-1 border-2 border-gradient-to-r  rounded-lg p-4 mb-4 lg:mb-0 shadow-lg">
            {hasValidTrack && (
              <audio
                ref={audioRef}
                src={track.url}
                preload="none"
              />
            )}

            {/* Track Info */}
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto mb-2 border-2 border-gradient-to-r from-purple-400 to-blue-400 rounded-full overflow-hidden">
                {hasValidTrack && track.coverImage ? (
                  <img 
                    src={track.coverImage} 
                    alt={track.title}
                    className={`w-full h-full object-cover transition-all duration-300 ${isPlaying ? 'scale-110' : ''}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Volume2 size={20} className={`transition-all duration-300 ${isPlaying ? 'scale-110 text-purple-600' : 'text-blue-600'}`} />
                  </div>
                )}
              </div>
              <h2 className="font-semibold text-sm truncate">
                {hasValidTrack ? track.title : fetchingTracks ? 'Loading...' : 'No track selected'}
              </h2>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div
                ref={progressRef}
                className="w-full h-1 border border-purple-300  rounded-full cursor-pointer hover:h-2 transition-all duration-200"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full transition-all duration-100 shadow-sm"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-3">
              <button
                onClick={prevTrack}
                disabled={currentTrack === 0 || !hasValidTrack}
                className="p-1 border-2 border-purple-300 rounded-full hover:border-purple-400 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
              >
                <SkipBack size={16} className="text-purple-600" />
              </button>

              <button
                onClick={togglePlay}
                disabled={!hasValidTrack}
                className="p-2 border-2 border-gradient-to-r from-purple-400 to-blue-400  rounded-full hover:from-purple-200 hover:to-blue-200 disabled:opacity-50 transition-all duration-200 hover:scale-105 shadow-lg"
              >
                {isPlaying ? (
                  <Pause size={16} className="text-purple-600" />
                ) : (
                  <Play size={16} className="ml-0.5 text-purple-600" />
                )}
              </button>

              <button
                onClick={nextTrack}
                disabled={currentTrack === tracks.length - 1 || !hasValidTrack}
                className="p-1 border-2 border-blue-300 rounded-full hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
              >
                <SkipForward size={16} className="text-blue-600" />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <Volume2 size={12} className="text-purple-500" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-gradient-to-r  rounded-full appearance-none cursor-pointer slider transition-all duration-200 hover:h-2"
              />
            </div>
          </div>

          {/* Playlist Section */}
          <div className="lg:col-span-2 border-2 border-gradient-to-r  rounded-lg shadow-lg">
            <div className="p-3 border-b border-gradient-to-r from-cyan-200 to-green-200">
              <h3 className="font-semibold text-sm text-gray-700">
                Playlist {tracks.length > 0 && `(${tracks.length} tracks)`}
              </h3>
            </div>
            
            <div className="h-48 overflow-y-auto">
              {tracks.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm mb-2">No tracks available</p>
                  <button
                    onClick={() => setTracks(LOCAL_TRACKS)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:border-gray-400 transition-colors"
                  >
                    Load Tracks
                  </button>
                </div>
              ) : (
                <>
                  {tracks.map((t, index) => (
                    <button
                      key={t.id}
                      onClick={() => handleTrackSelect(index)}
                      className={`w-full p-3 text-left transition-all duration-200 ${
                        index === currentTrack 
                          ? 'bg-gradient-to-r from-transparent  to-blue-900/90 border-r-4 border-gradient-to-b from-purple-400 via-pink-400 to-blue-400 shadow-md' 
                          : 'hover:bg-gradient-to-r hover:from-cyan-50 hover:to-green-50'
                      } border-b border-gray-100 last:border-b-0`}
                    >
                      <div className="truncate text-sm font-medium flex items-center">
                        {index === currentTrack && isPlaying && (
                          <div className="w-2 h-2 mr-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse shadow-sm"></div>
                        )}
                        <div className="w-8 h-8 mr-3 rounded border overflow-hidden flex-shrink-0">
                          <img 
                            src={t.coverImage} 
                            alt={t.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span>
                          {t.title}
                        </span>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a855f7, #3b82f6);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(168, 85, 247, 0.3);
          transition: all 0.2s ease;
        }
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.3);
          box-shadow: 0 4px 12px rgba(168, 85, 247, 0.5);
        }
        .slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a855f7, #3b82f6);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(168, 85, 247, 0.3);
          transition: all 0.2s ease;
        }
        .slider::-moz-range-thumb:hover {
          transform: scale(1.3);
          box-shadow: 0 4px 12px rgba(168, 85, 247, 0.5);
        }
      `}</style>
    </div>
  )
}