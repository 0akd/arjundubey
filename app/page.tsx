"use client"

import { lazy, Suspense } from 'react'
import { useInView } from 'react-intersection-observer'
import { siteConfig } from '@/lib/seo'

import type { Metadata } from 'next'
// Lazy load components
export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to our amazing Next.js application with TypeScript',
  openGraph: {
    title: 'Home',
    description: 'Welcome to our amazing Next.js application with TypeScript',
    url: `${siteConfig.url}`,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: 'Home Page',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Home',
    description: 'Welcome to our amazing Next.js application with TypeScript',
    images: [siteConfig.ogImage],
  },
  alternates: {
    canonical: `${siteConfig.url}`,
  },
}

const Hero = lazy(() => import('./Hero/page'))
const About = lazy(() => import('./about/page'))
const Expedu = lazy(() => import('./education/page'))
const Projects = lazy(() => import('./projects/page'))
const Blog = lazy(() => import('./blog/page'))




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
     <>
      <SEOHead
        title="Home Page"
        description="This is the home page of my awesome Next.js app"
        url="https://yoursite.com"
        keywords={["nextjs", "react", "typescript", "seo"]}
      />
      
      {/* Alternative using next-seo */}
      <NextSeo
        title="Home Page"
        description="This is the home page of my awesome Next.js app"
        canonical="https://yoursite.com"
        openGraph={{
          url: 'https://yoursite.com',
          title: 'Home Page',
          description: 'This is the home page of my awesome Next.js app',
          images: [
            {
              url: 'https://yoursite.com/og-image.jpg',
              width: 1200,
              height: 630,
              alt: 'Home Page',
            },
          ],
        }}
      />
      
      <main>
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
      
   
    
  
    </div></main>  </>
  )
}