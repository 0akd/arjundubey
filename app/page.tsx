"use client"

import { lazy, Suspense } from 'react'
import { useInView } from 'react-intersection-observer'

// Lazy load components
const Stats = lazy(() => import('./stats/page'))
const Hero = lazy(() => import('./Hero/page'))
const About = lazy(() => import('./about/page'))
const Expedu = lazy(() => import('./education/page'))
const Projects = lazy(() => import('./projects/page'))
const Blog = lazy(() => import('./blog/page'))
const LLm = lazy(() => import('./llm/page'))

// Wrapper component for lazy loading with intersection observer
function LazySection({ 
  children, 
  fallback = <div className="min-h-screen flex items-center justify-center">Loading...</div>,
  rootMargin = "100px"
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
  rootMargin?: string
}) {
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

export default function Home() {
  return (
    <div>
      {/* Nav is always loaded as it's typically needed immediately */}
      
    
       
   
     <LazySection>
        <Hero />
      </LazySection>
      
      <LazySection>
        <About />
      </LazySection>
      
      <LazySection>
        <Expedu />
      </LazySection>
      
      <LazySection>
        <Projects />
      </LazySection>
      
      <LazySection>
        <Blog />
      </LazySection>
      
      <LazySection>
        <LLm />
      </LazySection>
      
      <LazySection>
        <Stats />
      </LazySection>
    </div>
  )
}