import { lazy, Suspense } from 'react'
import { siteConfig } from '@/lib/seo'
import type { Metadata } from 'next'
import LazySection from '@/components/LazySection' // We'll create this as a separate client component
import ClientSEOWrapper from '@/components/ClientSEOWrapper'
// This stays as a server component - metadata export is allowed here
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

// Lazy load components
const Hero = lazy(() => import('./Hero/page'))
const About = lazy(() => import('./about/page'))
const Expedu = lazy(() => import('./education/page'))
const Projects = lazy(() => import('./projects/page'))
const Blog = lazy(() => import('./blog/page'))

export default function Home() {
  return (  <>
      {/* Optional: Additional client-side SEO components */}
      <ClientSEOWrapper
        title="Home Page"
        description="This is the home page of my awesome Next.js app"
        url="https://yoursite.com"
        keywords={["nextjs", "react", "typescript", "seo"]}
      />
      
     
    <main>
      <div>
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
      </div>
    </main></>
  )
}