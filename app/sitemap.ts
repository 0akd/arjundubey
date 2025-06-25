import { MetadataRoute } from 'next'
import supabase from '@/config/supabase'

// Define your base URL
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.arjundubey.com'

// Static routes that don't change often
const staticRoutes = [
  '',
  '/about',
  '/education',
  '/projects',
  '/blog',
  '/music',
  '/display',
  '/donate',
]

// Function to get dynamic blog posts from Supabase
async function getBlogPosts() {
  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('slug, created_at, updated_at')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching blog posts for sitemap:', error)
      return []
    }

    return posts.map((post) => ({
      slug: post.slug,
      lastModified: post.updated_at || post.created_at,
      priority: 1
    }))
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }
}

// Add other dynamic content functions here if needed
// For example, if you have projects or other dynamic pages

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get current date for static pages
  const now = new Date()
  
  // Build static routes
  const staticSitemapEntries: MetadataRoute.Sitemap = staticRoutes.map(route => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: 'hourly' as const,
    priority: route === '' ? 1 : 1,
  }))

  // Get dynamic blog posts
  const blogPosts = await getBlogPosts()

  // Build blog post routes
  const blogSitemapEntries: MetadataRoute.Sitemap = blogPosts.map(post => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.lastModified),
    changeFrequency: 'hourly' as const,
    priority: post.priority,
  }))

  // Combine all routes
  return [
    ...staticSitemapEntries,
    ...blogSitemapEntries,
  ]
}

// Example: If you have a projects table in Supabase
async function getProjects() {
  try {
    const { data: projects, error } = await supabase
      .from('projects') // Replace with your actual table name
      .select('slug, created_at, updated_at')
      .eq('published', true) // If you have a published field
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects for sitemap:', error)
      return []
    }

    return projects.map((project) => ({
      slug: project.slug,
      lastModified: project.updated_at || project.created_at,
      priority: 1
    }))
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }
}