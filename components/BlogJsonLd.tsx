'use client'

import { BlogPost } from '@/types/blogs'

interface BlogJsonLdProps {
  post: BlogPost
  baseUrl?: string
}

export default function BlogJsonLd({ post, baseUrl = 'https://www.arjundubey.com' }: BlogJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.image_url,
    author: {
      '@type': 'Person',
      name: post.author || 'Arjun Dubey',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Person',
      name: 'Arjun Dubey',
      url: baseUrl,
    },
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${post.id}`,
    },
    url: `${baseUrl}/blog/${post.id}`,
    keywords: post.tags?.join(', ') || 'blog, web development, programming',
    articleBody: post.content,
    wordCount: post.content.split(' ').length,
    genre: 'Technology',
    inLanguage: 'en-US',
    isAccessibleForFree: true,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}