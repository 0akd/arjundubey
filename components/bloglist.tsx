'use client';

import React, { useState, useEffect } from 'react';
import supabase  from '@/config/supabase';
import { BlogPost } from '@/types/blogs';
import BlogCard from './blogcard';

const BlogList: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Fetched blog posts:', data); // Debug log
      
      // Log each post's ID to verify they exist
      data?.forEach((post, index) => {
        console.log(`Post ${index + 1}:`, {
          id: post.id,
          title: post.title,
          published: post.published
        });
      });
      
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching posts:', err); // Debug log
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-12 rounded-lg mx-auto max-w-md mb-4 animate-pulse" />
            <div className="h-6 rounded-lg mx-auto max-w-lg animate-pulse" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48" />
                <div className="p-6">
                  <div className="h-6 rounded mb-3" />
                  <div className="h-4 rounded mb-2" />
                  <div className="h-4 rounded mb-4 w-3/4" />
                  <div className="flex justify-between">
                    <div className="h-4 rounded w-24" />
                    <div className="h-4 rounded w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border rounded-xl p-8 text-center">
            <div className="text-lg font-semibold mb-2">
              Error Loading Blog Posts
            </div>
            <p className="mb-4">{error}</p>
            <button 
              onClick={fetchPosts}
              className="px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Our Blog
          </h1>
          <p className="text-xl max-w-2xl mx-auto">
            Discover insights, tutorials, and stories from our team
          </p>
          
          {/* Debug info - remove this in production */}
          <div className="mt-4 text-sm">
            Found {posts.length} published posts
          </div>
        </div>

        {/* Blog Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">
              No blog posts yet
            </h3>
            <p>
              Check back soon for new content!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <div key={post.id} className="relative">
                <BlogCard post={post} />
                {/* Debug info - remove this in production */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-xs px-2 py-1 rounded">
                  ID: {post.id}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;