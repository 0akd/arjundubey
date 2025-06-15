// components/SEOHead.tsx
import Head from 'next/head'
import { SEOProps, generateSEOConfig, siteConfig } from '@/lib/seo'

interface SEOHeadProps extends SEOProps {
  children?: React.ReactNode
}

export default function SEOHead({
  title,
  description,
  image,
  url,
  keywords,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  children,
}: SEOHeadProps) {
  const seoConfig = generateSEOConfig({
    title,
    description,
    image,
    url,
    keywords,
    type,
    publishedTime,
    modifiedTime,
    author,
  })

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": type === "article" ? "Article" : "WebSite",
    name: seoConfig.title,
    description: seoConfig.description,
    url: seoConfig.alternates.canonical,
    ...(type === "article" && {
      headline: title,
      author: {
        "@type": "Person",
        name: author || siteConfig.name,
      },
      publisher: {
        "@type": "Organization",
        name: siteConfig.name,
      },
      datePublished: publishedTime,
      dateModified: modifiedTime,
    }),
  }

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{seoConfig.title}</title>
      <meta name="description" content={seoConfig.description} />
      <meta name="keywords" content={seoConfig.keywords} />
      <meta name="author" content={author || siteConfig.name} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={seoConfig.alternates.canonical} />

      {/* Open Graph */}
      <meta property="og:type" content={seoConfig.openGraph.type} />
      <meta property="og:title" content={seoConfig.openGraph.title} />
      <meta property="og:description" content={seoConfig.openGraph.description} />
      <meta property="og:url" content={seoConfig.openGraph.url} />
      <meta property="og:site_name" content={seoConfig.openGraph.siteName} />
      <meta property="og:image" content={seoConfig.openGraph.images[0].url} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={seoConfig.openGraph.images[0].alt} />
      
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content={seoConfig.twitter.card} />
      <meta name="twitter:title" content={seoConfig.twitter.title} />
      <meta name="twitter:description" content={seoConfig.twitter.description} />
      <meta name="twitter:image" content={seoConfig.twitter.images[0]} />
      <meta name="twitter:creator" content={seoConfig.twitter.creator} />

      {/* Robots */}
      <meta name="robots" content="index,follow" />
      <meta name="googlebot" content="index,follow" />

      {/* Favicons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {children}
    </Head>
  )
}