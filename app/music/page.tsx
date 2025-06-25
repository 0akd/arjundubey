'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, ChevronUp, ChevronDown, List } from 'lucide-react'

interface Track {
  id: string
  title: string
  url: string
  coverVideo: string
  duration?: number
}

// Local tracks array with music file links and cover videos
const LOCAL_TRACKS: Track[] = [
  {
    id: '1',
    title: 'menory reboot + fainted',
    url: 'https://mkw3xpovahzkrpq2.public.blob.vercel-storage.com/music/Fainted%20x%20Memory%20Reboot%20-%20Narvent%20-%20%284K%20Music%20Video%29%20%28Mashup%20version%29%20%28ShowUsmusic%20Remix%29-G5b6Fvv0hgF7bnggqj42M7d1cxnlcr.m4a',
    coverVideo: 'https://mkw3xpovahzkrpq2.public.blob.vercel-storage.com/video/Blade%20Runner%202049%20_%20stellar-FvM8yZACX6du3UVkFyLGk5TJHKpxzv.mp4'
  },
  {
    id: '2',
    title: 'Lost Soul Down NBSPLV',
    url: 'https://mkw3xpovahzkrpq2.public.blob.vercel-storage.com/music/NBSPLV_-_The_lost_soul_down_X_Lost_soul__%28ChainsawMan_Girls%29%5B1%5D-liq3EBAIoPR7Y5sdl8AOHscg7raHIB.m4a',
    coverVideo: 'YOUR_VIDEO_LINK_HERE'
  },
  {
    id: '3',
    title: 'We Are',
    url: 'https://mkw3xpovahzkrpq2.public.blob.vercel-storage.com/music/We_Are%5B1%5D-htzfT8vew2DsfsA60H42xVDLgOV50W.m4a',
    coverVideo: 'YOUR_VIDEO_LINK_HERE'
  },
  {
    id: '4',
    title: 'Tri Poloski',
    url: 'https://mkw3xpovahzkrpq2.public.blob.vercel-storage.com/music/Tri_Poloski%5B1%5D-EMLQBoTtHRomr9jDMTmdbxJkhFeifN.m4a',
    coverVideo: 'YOUR_VIDEO_LINK_HERE'
  },
  {
    id: '5',
    title: 'Narkotik Kal',
    url: 'https://mkw3xpovahzkrpq2.public.blob.vercel-storage.com/music/Narkotik_Kal%5B1%5D-GceMb1QnzGkfpFVJpZj8R77xCEMBSK.m4a',
    coverVideo: 'YOUR_VIDEO_LINK_HERE'
  },
  {
    id: '6',
    title: 'Kompa Jersey',
    url: 'https://mkw3xpovahzkrpq2.public.blob.vercel-storage.com/music/Kompa_Jersey%5B1%5D-hdFnKgWqERJSga285y1TUkuJGXqVTJ.m4a',
    coverVideo: 'YOUR_VIDEO_LINK_HERE'
  },
  {
    id: '7',
    title: 'Chubina Slowed',
    url: 'https://mkw3xpovahzkrpq2.public.blob.vercel-storage.com/music/Chub1na_%E2%80%93_%28_slowed_by_Supremacy_%29%5B1%5D-LJpAjWCa4pcDNYHsLnVgslUb7hf0CQ.m4a',
    coverVideo: 'YOUR_VIDEO_LINK_HERE'
  },
  {
    id: '8',
    title: 'Matushka',
    url: 'https://mkw3xpovahzkrpq2.public.blob.vercel-storage.com/music/%D0%9C%D0%B0%D1%82%D1%83%D1%88%D0%BA%D0%B0%5B1%5D-zb80yTlpQl4t7UnbKEIE2LRPPB0kzt.m4a',
    coverVideo: 'YOUR_VIDEO_LINK_HERE'
  },
  {
    id: '9',
    title: 'Slava funk slowed',
    url: 'https://mkw3xpovahzkrpq2.public.blob.vercel-storage.com/music/SLAVA.m4a',
    coverVideo: 'YOUR_VIDEO_LINK_HERE'
  },
  {
    id: '10',
    title: 'Slava funk',
    url: 'https://mkw3xpovahzkrpq2.public.blob.vercel-storage.com/music/SLAVA%20FUNK%21.m4a',
    coverVideo: 'YOUR_VIDEO_LINK_HERE'
  },
  {
    id: '11',
    title: 'Legends Never Die',
    url: 'https://mkw3xpovahzkrpq2.public.blob.vercel-storage.com/music/Legends_Never_Die-IOZ02emJv5ESaoi90EkeehmXy2w1Xk.m4a',
    coverVideo: 'YOUR_VIDEO_LINK_HERE'
  },
  {
    id: '12',
    title: 'Goggins Speech',
    url: 'https://mkw3xpovahzkrpq2.public.blob.vercel-storage.com/music/z_large_file_size_pending_upload-xj4CiADvh07cbqspGj0h7au8K0ErJR.m4a',
    coverVideo: 'YOUR_VIDEO_LINK_HERE'
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
  const [isPlaylistExpanded, setIsPlaylistExpanded] = useState(false)
  const [videoDuration, setVideoDuration] = useState(0)

  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Video sync and loop logic
  useEffect(() => {
  const video = videoRef.current
  const audio = audioRef.current
  
  if (!video || !audio || !isPlaying) return

  const syncVideo = () => {
    const audioCurrentTime = audio.currentTime
    const videoCurrentTime = video.currentTime
    
    // If video is shorter than audio, calculate loop position
    if (videoDuration > 0 && audioCurrentTime > videoDuration) {
      const loopTime = audioCurrentTime % videoDuration
      // More precise sync threshold
      if (Math.abs(videoCurrentTime - loopTime) > 0.2) {
        video.currentTime = loopTime
      }
    } else {
      // Normal sync - more precise threshold
      if (Math.abs(videoCurrentTime - audioCurrentTime) > 0.2) {
        video.currentTime = audioCurrentTime
      }
    }

    // Ensure video is playing when audio is playing
    if (video.paused && !audio.paused && !audio.ended) {
      video.play().catch(console.error)
    }
  }

  // Sync more frequently for smoother looping
  const syncInterval = setInterval(syncVideo, 200) // Changed from 1000ms to 200ms
  return () => clearInterval(syncInterval)
}, [isPlaying, videoDuration, currentTime])


  useEffect(() => {
    const audio = audioRef.current
    const video = videoRef.current
    if (!audio || !video) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    
    const handleLoadStart = () => {
      console.log('Audio loadstart event')
      setAudioLoading(true)
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
      loadingTimeoutRef.current = setTimeout(() => {
        console.log('Audio loading timeout - clearing loading state')
        setAudioLoading(false)
        setIsPlaying(false)
      }, 10000)
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
      // Start video when audio starts playing
      if (video.paused) {
        video.play().catch(console.error)
      }
    }
    
    const handlePause = () => {
      // Pause video when audio pauses
      if (!video.paused) {
        video.pause()
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
      video.pause()
      video.currentTime = 0
      if (currentTrack < tracks.length - 1) {
        setCurrentTrack(prev => prev + 1)
      } else {
        setIsPlaying(false)
        setCurrentTrack(0)
      }
    }

    // Video event handlers
    const handleVideoLoadedMetadata = () => {
      setVideoDuration(video.duration)
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('playing', handlePlaying)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    
    video.addEventListener('loadedmetadata', handleVideoLoadedMetadata)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('playing', handlePlaying)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      
      video.removeEventListener('loadedmetadata', handleVideoLoadedMetadata)
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [currentTrack, tracks.length])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    const video = videoRef.current
    
    if (audio && video && tracks.length > 0 && isPlaying) {
      const playAudio = async () => {
        try {
          await audio.play()
          // Video will be played by the 'playing' event handler
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

  // Reset video when track changes
  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.currentTime = 0
      setVideoDuration(0)
    }
  }, [currentTrack])

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
        if (window.innerWidth < 1024) {
          setIsPlaylistExpanded(true)
        }
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
    
    // Sync video to new time
    if (videoRef.current) {
      if (videoDuration > 0 && newTime > videoDuration) {
        videoRef.current.currentTime = newTime % videoDuration
      } else {
        videoRef.current.currentTime = newTime
      }
    }
  }
useEffect(() => {
  const video = videoRef.current
  const audio = audioRef.current
  
  if (!video || !audio) return

  const handleVideoEnded = () => {
    // If audio is still playing and video has ended, restart the video
    if (isPlaying && !audio.paused && !audio.ended) {
      video.currentTime = 0
      video.play().catch(console.error)
    }
  }

  video.addEventListener('ended', handleVideoEnded)
  
  return () => {
    video.removeEventListener('ended', handleVideoEnded)
  }
}, [isPlaying])
  const handleTrackSelect = (index: number) => {
    setCurrentTrack(index)
    setIsPlaying(true)
    if (window.innerWidth < 1024) {
      setIsPlaylistExpanded(true)
    }
  }

  const togglePlaylist = () => {
    setIsPlaylistExpanded(prev => !prev)
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

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
    <div className="p-4">
      <div className="max-w-sm lg:max-w-4xl mx-auto">
        <div className="lg:grid lg:grid-cols-3 lg:gap-6 lg:items-start">
          {/* Player Section */}
          <div className="lg:col-span-1 border-2 border-gradient-to-r rounded-lg p-4 mb-4 lg:mb-0 shadow-lg">
            {hasValidTrack && (
              <>
                <audio
                  ref={audioRef}
                  src={track.url}
                  preload="none"
                />
                <video
                  ref={videoRef}
                  src={track.coverVideo}
                  preload="metadata"
                  muted
                  loop={false}
                  className="hidden"
                />
              </>
            )}

            {/* Track Info */}
            <div className="text-center mb-4">
              <div className=" mx-auto mb-2 border-2 border-gradient-to-r from-purple-400 to-blue-400 rounded-full overflow-hidden">
                {hasValidTrack && track.coverVideo ? (
                  <video
                    ref={videoRef}
                    src={track.coverVideo}
                    preload="metadata"
                    muted
                    loop={false}
                    className={`w-full h-full object-contain`}
                    style={{ objectPosition: 'center' }}
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
                className="w-full h-2 border border-purple-300 rounded-full cursor-pointer  "
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-gradient-to-r from-cyan-300 to-blue-400 rounded-full transition-all duration-100 shadow-sm"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-3">
              <button
                onClick={prevTrack}
                disabled={currentTrack === 0 || !hasValidTrack}
                className="p-1 border-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
              >
                <SkipBack size={50} className="" />
              </button>

              <button
                onClick={togglePlay}
                disabled={!hasValidTrack}
                className="p-2 border-2 border-gradient-to-r from-purple-400 to-blue-400 rounded-full hover:from-purple-200 hover:to-blue-200 disabled:opacity-50 transition-all duration-200 hover:scale-105 shadow-lg"
              >
                {audioLoading ? (
                  <div className="w-15 h-15 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause size={50} className="text-cyan-300" />
                ) : (
                  <Play size={50} className="ml-0.5 text-cyan-600" />
                )}
              </button>

              <button
                onClick={nextTrack}
                disabled={currentTrack === tracks.length - 1 || !hasValidTrack}
                className="p-1 border-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
              >
                <SkipForward size={50} className="" />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2 mb-4">
              <Volume2 size={12} className="text-purple-500" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-gradient-to-r rounded-full appearance-none cursor-pointer slider transition-all duration-200 hover:h-2"
              />
            </div>

            {/* Playlist Toggle Button (Mobile Only) */}
            <div className="lg:hidden">
              <button
                onClick={togglePlaylist}
                className="w-full flex items-center justify-center gap-2 p-3 border-2 border-gradient-to-r from-purple-300 to-blue-300 rounded-lg hover:from-purple-200 hover:to-blue-200 transition-all duration-200 shadow-md"
              >
                <List size={20} className="text-purple-600" />
                <span className="font-medium text-purple-600">
                  {isPlaylistExpanded ? 'Hide Playlist' : 'Show Playlist'}
                </span>
                {isPlaylistExpanded ? (
                  <ChevronUp size={20} className="text-purple-600" />
                ) : (
                  <ChevronDown size={20} className="text-purple-600" />
                )}
              </button>
            </div>
          </div>

          {/* Playlist Section */}
          <div className={`lg:col-span-2 border-2 border-gradient-to-r rounded-lg shadow-lg transition-all duration-300 ease-in-out lg:block ${
            isPlaylistExpanded ? 'block' : 'hidden'
          }`}>
            <div className="p-3 border-b border-gradient-to-r from-cyan-200 to-green-200 flex items-center justify-between">
              <h3 className="font-semibold text-sm">
                Playlist {tracks.length > 0 && `(${tracks.length} tracks)`}
              </h3>
              <button
                onClick={togglePlaylist}
                className="lg:hidden p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronUp size={16} className="text-gray-600" />
              </button>
            </div>
            
            <div className="h-95 overflow-y-auto">
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
                      key={`${t.id}-${index}`}
                      onClick={() => handleTrackSelect(index)}
                      className={`w-full p-3 text-left transition-all duration-200 ${
                        index === currentTrack 
                          ? 'bg-gradient-to-r from-transparent to-blue-900/90 border-r-4 border-gradient-to-b from-pink-900 to-blue-900/90 shadow-md' 
                          : 'hover:bg-gradient-to-r'
                      } border-b border-gray-100 last:border-b-0`}
                    >
                      <div className="truncate text-sm font-medium flex items-center">
                        {index === currentTrack && isPlaying && (
                          <div className="w-4 h-4 mr-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse shadow-sm"></div>
                        )}
                        <div className="w-8 h-8 mr-3 rounded border overflow-hidden flex-shrink-0">
                          <video 
                            src={t.coverVideo} 
                            className="w-full h-full object-cover"
                            muted
                            preload="none"
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