'use client'
import './globals.css'  // Import your global CSS file
import { ThemeProvider } from 'next-themes'
import type { Metadata, Viewport } from 'next'

import { cn } from "@/lib/utils";
import CursorTrailCanvas from "@/cursortrail/page";
import { DefaultSeo } from 'next-seo'
import { siteConfig } from '@/lib/seo'

import { lazy, Suspense } from 'react'
export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [
    {
      name: siteConfig.name,
      url: siteConfig.url,
    },
  ],
  creator: siteConfig.creator,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.creator,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}
const defaultSEO = {
  title: siteConfig.name,
  description: siteConfig.description,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    handle: siteConfig.creator,
    site: siteConfig.creator,
    cardType: 'summary_large_image',
  },
}


  const Nav = lazy(()=>import('./nav/page'))
  const Footr = lazy(()=>import('./footr/page'))
  const Llm = lazy(()=>import('./llm/page'))

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html suppressHydrationWarning>
      <head />
      <body><main    className={cn(
            "bg-transparent  bg-[radial-gradient(#2f7df4_1px,transparent_1px)] [background-size:16px_16px]",
           
          )}>
        <ThemeProvider> <CursorTrailCanvas className="pointer-events-none inset-0 -z-10 " /><Nav/>   <DefaultSeo {...defaultSEO} />{children}<Llm/><Footr/></ThemeProvider></main>
      </body>
    </html>
  )
}
