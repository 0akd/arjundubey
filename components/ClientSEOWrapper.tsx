'use client'

import SEOHead from '@/components/SEOHead'
import { NextSeo } from 'next-seo'

interface ClientSEOWrapperProps {
  title: string
  description: string
  url: string
  keywords?: string[]
}

export default function ClientSEOWrapper({ title, description, url, keywords }: ClientSEOWrapperProps) {
  return (
    <>
      <SEOHead
        title={title}
        description={description}
        url={url}
        keywords={keywords}
      />
      
      <NextSeo
        title={title}
        description={description}
        canonical={url}
        openGraph={{
          url: url,
          title: title,
          description: description,
          images: [
            {
              url: 'https://yoursite.com/og-image.jpg',
              width: 1200,
              height: 630,
              alt: title,
            },
          ],
        }}
      />
    </>
  )
}