'use client'

import { Suspense } from 'react'
import { useInView } from 'react-intersection-observer'

interface LazySectionProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  rootMargin?: string
}

export default function LazySection({ 
  children, 
  fallback = <div className="min-h-screen flex items-center justify-center">Loading...</div>,
  rootMargin = "100px"
}: LazySectionProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin
  })

  return (
    <div ref={ref}>
      {inView ? (
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      ) : (
        <div className="min-h-[200px]" /> // Placeholder to maintain layout
      )}
    </div>
  )
}