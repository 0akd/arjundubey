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
        className="fixed top-0 left-0 right-0 h-1 bg-cyan-400 origin-left z-50 shadow-lg"
        style={{ scaleX }}
      />
      
      {/* Scroll indicator dots */}
     
      {children}
    </>
  )
}