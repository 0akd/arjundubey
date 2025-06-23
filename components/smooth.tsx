'use client'

import { useEffect } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'

interface SmoothScrollProviderProps {
  children: React.ReactNode
}

export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  useEffect(() => {
    let isScrolling = false
    
    // Enhanced smooth scrolling with reduced speed
    const handleWheel = (e: WheelEvent) => {
      // Check if user prefers reduced motion
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      if (mediaQuery.matches) return
      
      // Prevent default scrolling
      e.preventDefault()
      
      if (isScrolling) return
      
      isScrolling = true
      
      const delta = e.deltaY
      const scrollStep = delta * 0.5 // Reduce scroll speed significantly
      const currentScroll = window.pageYOffset
      const newScroll = currentScroll + scrollStep
      
      // Smooth scroll animation
      const startTime = performance.now()
      const duration = 800 // ms
      
      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Easing function for smooth animation
        const easeProgress = 1 - Math.pow(1 - progress, 3)
        
        const scrollPosition = currentScroll + (scrollStep * easeProgress)
        window.scrollTo(0, scrollPosition)
        
        if (progress < 1) {
          requestAnimationFrame(animateScroll)
        } else {
          isScrolling = false
        }
      }
      
      requestAnimationFrame(animateScroll)
    }

    // Add event listener with passive: false to allow preventDefault
    window.addEventListener('wheel', handleWheel, { passive: false })
    
    // Clean up
    return () => {
      window.removeEventListener('wheel', handleWheel)
    }
  }, [])

  return (
    <>
      {/* Scroll progress indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 origin-left z-50 shadow-lg"
        style={{ scaleX }}
      />
      
      {/* Scroll indicator dots */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 hidden lg:flex flex-col space-y-3">
        {[...Array(9)].map((_, i) => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full bg-gray-300 cursor-pointer hover:bg-blue-500 transition-colors shadow-md backdrop-blur-sm"
            whileHover={{ scale: 1.5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              const sections = document.querySelectorAll('main > div > div')
              if (sections[i]) {
                sections[i].scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                })
              }
            }}
          />
        ))}
      </div>
      
      {children}
    </>
  )
}