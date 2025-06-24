import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BlogPostComponent from '@/components/blogpost'
import supabase from '@/config/supabase'
import { BlogPost } from '@/types/blogs'

interface BlogPostPageProps {
  params: Promise<{ id: string }>
}

// Function to fetch blog post data (used by both generateMetadata and the component)
async function getBlogPost(id: string): Promise<BlogPost | null> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
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

// Generate dynamic metadata for each blog post
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { id } = await params
  const post = await getBlogPost(id)

  if (!post) {
    return {
      title: 'Post Not Found - Arjun Dubey',
      description: 'The blog post you are looking for could not be found.',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.arjundubey.com'
  const postUrl = `${baseUrl}/blog/${post.id}`

  return {
    title: `${post.title} - Arjun Dubey`,
    description: post.description,
    keywords: post.tags?.join(', ') || 'blog, web development, programming',
    authors: [{ name: 'Arjun Dubey' }],
    creator: 'Arjun Dubey',
    publisher: 'Arjun Dubey',
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url: postUrl,
      siteName: 'Arjun Dubey',
      images: [
        {
          url: post.image_url,
          width: 1200,
          height: 630,
          alt: post.title,
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
      images: [post.image_url],
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
  const { id } = await params
  const post = await getBlogPost(id)

  // If post doesn't exist, return 404
  if (!post) {
    notFound()
  }

  return <BlogPostComponent postId={id} />
}