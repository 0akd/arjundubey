import { lazy, Suspense } from 'react'
import { siteConfig } from '@/lib/seo'
import type { Metadata } from 'next'
import LazySection from '@/components/LazySection' // We'll create this as a separate client component
import ClientSEOWrapper from '@/components/ClientSEOWrapper'
import SmoothScrollStyles from '@/components/scrollstyle'
import PageWrapper from '@/components/pagewrap'
import UnderConstructionOverlay from './underconstruction'

// This stays as a server component - metadata export is allowed here
export const metadata: Metadata = {
  title: 'Arjun Dubey',
  description: "They don't know me son , so its my portfolio site Arjun Dubey's Portfolio",
  openGraph: {
    title: 'Arjun Dubey',
    description:"They don't know me son , so its my portfolio site Arjun Dubey's Portfolio",
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
    title: 'Arjun Dubey',
    description: "They don't know me son , so its my portfolio site Arjun Dubey's Portfolio",
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
// const Progress = lazy(() => import('./reality/page'))
const Donate = lazy(() => import ('./donate/page'))
const LeeCode = lazy(() => import ('./leetcode/page'))
const Music = lazy(() => import ('./music/page'))

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

export default function Home() {
  return (
    <>
      {/* Optional: Additional client-side SEO components */}
      <ClientSEOWrapper
        title="Arjun Dubey"
        description="They dont know me son , so its my portfolio site Arjun Dubeys Portfolio"
        url="https://www.arjundubey.com/"
        keywords={["Arjun Dubey , arjundubey , arjundubey , Arjun Kumar Dubey , ArjunKumarDubey , arjun"]}
      />
      
      {/* Add smooth scrolling styles as a client component */}
      <SmoothScrollStyles />
        <UnderConstructionOverlay />
      <PageWrapper>
        <main className="overflow-hidden">
          <div>
            {/* Hero section - immediate load with fade */}
            <LazySection animationType="fadeIn" delay={0.8}>
              <Hero />
            </LazySection>
            
            {/* About section - slide from left */}
            <LazySection animationType="slideLeft" delay={1.6}>
              <About />
            </LazySection>
            
        
            
            {/* Projects section - slide from right */}
            <LazySection animationType="slideRight" delay={4}>
              <Projects />
            </LazySection>
                {/* Education section - fade up */}
            <LazySection animationType="fadeUp" delay={1}>
              <Expedu />
            </LazySection>
            {/* Blog section - scale animation */}
            <LazySection animationType="scale" delay={1.5}>
              <Blog />
            </LazySection>
            
          
       
            
            {/* Music section - slide from left */}
            <LazySection animationType="slideLeft" delay={1.5}>
              <Music />
            </LazySection>
            
            {/* Donate section - fade in */}
            <LazySection animationType="fadeIn" delay={1}>
              <Donate />
            </LazySection>
                 {/* <LazySection animationType="blur" delay={1.2}>
              <Progress />
            </LazySection> */}
            
            {/* LeetCode section - fade up */}
            <LazySection animationType="fadeUp" delay={1.6}>
              <LeeCode />
            </LazySection>
          </div>
        </main>
      </PageWrapper>
    </>
  )
}