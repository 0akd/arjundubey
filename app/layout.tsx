
import './globals.css'  // Import your global CSS file

import type { Metadata, Viewport } from 'next'
import Lazyw from './lazyshell'

import { cn } from "@/lib/utils";
import CursorTrailCanvas from "@/cursortrail/page";

import { siteConfig } from '@/lib/seo'


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




export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html suppressHydrationWarning>
      <head />
      <body><main    className={cn(
            "bg-transparent  bg-[radial-gradient(#2f7df4_1px,transparent_1px)] [background-size:16px_16px]",
           
          )}>
        <CursorTrailCanvas className="pointer-events-none inset-0 -z-10 " /><Lazyw> {children}</Lazyw></main>
      </body>
    </html>
  )
}
