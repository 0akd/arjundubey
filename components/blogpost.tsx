'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import supabase from '@/config/supabase';
import { BlogPost } from '@/types/blogs';
import BlogJsonLd from './BlogJsonLd';

interface BlogPostProps {
  postId: string;
}

const BlogPostComponent: React.FC<BlogPostProps> = ({ postId }) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('BlogPostComponent received postId:', postId); // Debug log
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching post with ID:', postId); // Debug log
      
      const { data, error, count } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', postId)
        .eq('published', true);

      console.log('Supabase response:', { data, error, count }); // Debug log

      if (error) {
        console.error('Supabase error:', error); // Debug log
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('Post not found or not published');
      }
      
      setPost(data[0]); // Take the first result
    } catch (err) {
      console.error('Error fetching post:', err); // Debug log
      setError(err instanceof Error ? err.message : 'Post not found');
    } finally {
      setLoading(false);
    }
  };

  // Simple markdown to HTML converter
  const markdownToHtml = (markdown: string) => {
    return markdown
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold mt-8 mb-4">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-10 mb-6">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-12 mb-8">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="px-2 py-1 bg-gray-100 rounded text-sm font-mono">$1</code>')
      .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed">')
      .replace(/^(.+)$/gm, '<p class="mb-4 leading-relaxed">$1</p>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>');
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-xl mb-8" />
            <div className="h-12 bg-gray-200 rounded-lg mb-4" />
            <div className="h-6 bg-gray-200 rounded-lg mb-8 w-3/4" />
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center bg-gray-50 rounded-xl p-12">
            <div className="text-6xl mb-4">😔</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Post Not Found
            </h1>
            <p className="text-gray-600 mb-2">
              {error || 'The blog post you\'re looking for doesn\'t exist.'}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Post ID: {postId}
            </p>
            <div className="space-y-4">
              <button 
                onClick={() => {
                  setError(null);
                  fetchPost();
                }}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 mr-4"
              >
                Try Again
              </button>
              <a 
                href="/blog"
                className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                ← Back to Blog
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <BlogJsonLd post={post} />
      
      <article className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <header className="mb-12">
            <div className="relative h-64 sm:h-80 lg:h-96 w-full rounded-xl overflow-hidden mb-8">
              <Image
                src={post.image_url}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
              />
            </div>
            
            <div className="text-sm text-gray-500 mb-4">
              {new Date(post.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
              {post.author && (
                <>
                  {' • '}
                  <span className="text-gray-700">By {post.author}</span>
                </>
              )}
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              {post.description}
            </p>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {post.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Content */}
          <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-code:text-pink-600 prose-code:bg-gray-100">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: markdownToHtml(post.content) 
              }} 
            />
          </div>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <a 
                href="/blog"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
              >
                ← Back to all posts
              </a>
              
              <div className="text-sm text-gray-500">
                {post.updated_at && post.updated_at !== post.created_at && (
                  <span>
                    Last updated: {new Date(post.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                )}
              </div>
            </div>
          </footer>
        </div>
      </article>
    </>
  );
};

export default BlogPostComponent;