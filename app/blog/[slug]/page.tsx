import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BlogPostComponent from '@/components/blogpost'
import supabase from '@/config/supabase'
import { BlogPost } from '@/types/blogs'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

// Generate static params using slugs for the first 10 published blog posts
export async function generateStaticParams() {
  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('slug')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching posts for static generation:', error)
      return []
    }

    return posts.map((post) => ({
      slug: post.slug,
    }))
  } catch (error) {
    console.error('Error in generateStaticParams:', error)
    return []
  }
}

// Function to fetch blog post data by slug (used by both generateMetadata and the component)
async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error) {
      console.error('Error fetching post for metadata:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getBlogPost:', error)
    return null
  }
}

// Helper function to generate OG image URL optimized for WhatsApp
function generateOGImageUrl(title: string, description?: string, author?: string, imageUrl?: string, square = false): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.arjundubey.com'
  const params = new URLSearchParams({
    title: title,
    // WhatsApp-optimized parameters
    width: '1200',
    height: square ? '1200' : '630',
    format: 'png',
    quality: '95',
    ...(square && { square: 'true' }),
    ...(description && { description: description }),
    ...(author && { author: author }),
    ...(imageUrl && { image: imageUrl }),
  })
  
  return `${baseUrl}/api/og?${params.toString()}`
}



// Generate dynamic metadata for each blog post
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    return {
      title: 'Post Not Found - Arjun Dubey',
      description: 'The blog post you are looking for could not be found.',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.arjundubey.com'
  const postUrl = `${baseUrl}/blog/${post.slug}`
  
  // Generate multiple OG image variants for better compatibility
  const ogImageUrl = generateOGImageUrl(post.title, post.description, 'Arjun Dubey', post.image_url, false)
  const whatsappImageUrl = generateOGImageUrl(post.title, post.description, 'Arjun Dubey', post.image_url, true)

  return {
    title: `${post.title} - Arjun Dubey`,
    description: post.description,
    keywords: post.tags?.join(', ') || 'blog, web development, programming',
    authors: [{ name: 'Arjun Dubey' }],
    creator: 'Arjun Dubey',
    publisher: 'Arjun Dubey',
    // Additional meta tags for better WhatsApp support
    other: {
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:type': 'image/png',
      'twitter:image:width': '1200',
      'twitter:image:height': '630',
      // WhatsApp-specific meta tags
      'whatsapp:image': ogImageUrl,
      'whatsapp:title': post.title,
      'whatsapp:description': post.description,
    },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url: postUrl,
      siteName: 'Arjun Dubey',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
          type: 'image/png',
        },
        // Additional square image for better WhatsApp mobile support
        {
          url: whatsappImageUrl,
          width: 1200,
          height: 1200,
          alt: post.title,
          type: 'image/png',
        },
      ],
      publishedTime: post.created_at,
      modifiedTime: post.updated_at || post.created_at,
      authors: ['Arjun Dubey'],
      tags: post.tags || [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [ogImageUrl],
      creator: '@yourtwitterhandle', // Replace with your Twitter handle
    },
    alternates: {
      canonical: postUrl,
    },
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
}

// Server component that renders the client component
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  // If post doesn't exist, return 404
  if (!post) {
    notFound()
  }

  return <BlogPostComponent postSlug={slug} />
}