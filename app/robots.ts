import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.arjundubey.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
          '/dashboard/',
          '/private/',
          '/temp/',
          '/*.json$',
 
  
        ],
      },
      // Specific rules for search engine bots
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
          '/dashboard/',
          '/private/',
        ],
        crawlDelay: 1, // 1 second delay between requests
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
          '/dashboard/',
          '/private/',
        ],
        crawlDelay: 2, // 2 second delay for Bing
      },
      // Block aggressive crawlers if needed
      {
        userAgent: [
          'AhrefsBot',
          'MJ12bot',
          'DotBot',
          'SemrushBot',
        ],
        disallow: '/',
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}