'use client';

import React, { useState, useRef, useEffect } from 'react';
import supabase from '@/config/supabase';
import { BlogPost } from '@/types/blogs';

interface BlogFormData {
  title: string;
  description: string;
  content: string;
  image_url: string;
  slug: string;
  published: boolean;
}

const AdminBlogUpload: React.FC = () => {
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    description: '',
    content: '',
    image_url: '',
    slug: '',
    published: false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      ...(name === 'title' && { slug: generateSlug(value) })
    }));

    // Handle image URL preview
    if (name === 'image_url') {
      setImageError(false);
      if (value.trim()) {
        setImagePreview(value);
      } else {
        setImagePreview('');
      }
    }
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImagePreview('');
  };

  // Fetch all blog posts
  const fetchBlogPosts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogPosts(data || []);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to fetch blog posts' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete blog post
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Blog post deleted successfully!' });
      fetchBlogPosts(); // Refresh the list
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to delete blog post' 
      });
    }
  };

  // Edit blog post
  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      description: post.description,
      content: post.content,
      image_url: post.image_url,
      slug: post.slug,
      published: post.published,
    });
    setImagePreview(post.image_url);
    
    // Scroll to form
    document.getElementById('blog-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      description: '',
      content: '',
      image_url: '',
      slug: '',
      published: false,
    });
    setImagePreview('');
    setImageError(false);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim() || !formData.description.trim() || !formData.content.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    if (!formData.image_url) {
      setMessage({ type: 'error', text: 'Please upload an image' });
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage(null);

      if (editingPost) {
        // Update existing post
        const { data, error } = await supabase
          .from('blog_posts')
          .update(formData)
          .eq('id', editingPost.id)
          .select()
          .single();

        if (error) throw error;

        setMessage({ type: 'success', text: 'Blog post updated successfully!' });
        setEditingPost(null);
      } else {
        // Create new post
        const { data, error } = await supabase
          .from('blog_posts')
          .insert([formData])
          .select()
          .single();

        if (error) throw error;

        setMessage({ type: 'success', text: 'Blog post created successfully!' });
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        content: '',
        image_url: '',
        slug: '',
        published: false,
      });
      setImagePreview('');
      setImageError(false);
      
      // Refresh blog posts list
      fetchBlogPosts();

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save blog post' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertMarkdown = (syntax: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let newText = '';
    switch (syntax) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`;
        break;
      case 'code':
        newText = `\`${selectedText || 'code'}\``;
        break;
      case 'link':
        newText = `[${selectedText || 'link text'}](url)`;
        break;
      case 'h1':
        newText = `# ${selectedText || 'Heading 1'}`;
        break;
      case 'h2':
        newText = `## ${selectedText || 'Heading 2'}`;
        break;
      case 'h3':
        newText = `### ${selectedText || 'Heading 3'}`;
        break;
    }

    const newContent = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));
    
    // Focus back to textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + newText.length, start + newText.length);
    }, 0);
  };

  // Fetch blog posts on component mount
  useEffect(() => {
    fetchBlogPosts();
  }, []);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl shadow-lg overflow-hidden">
          <div className="px-8 py-6">
            <h1 className="text-3xl font-bold">
              {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h1>
            <p className="mt-2">
              {editingPost ? 'Update your existing blog post' : 'Add a new blog post to your collection'}
            </p>
          </div>

          <form id="blog-form" onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Message Display */}
            {message && (
              <div className={`p-4 rounded-lg border ${
                message.type === 'success' 
                  ? 'border-green-300 bg-green-50 text-green-800' 
                  : 'border-red-300 bg-red-50 text-red-800'
              }`}>
                {message.text}
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                placeholder="Enter blog post title"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium mb-2">
                Slug (URL)
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                placeholder="url-friendly-slug"
              />
              <p className="text-sm mt-1 text-gray-600">Auto-generated from title, but you can customize it</p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors resize-y"
                placeholder="Brief description of your blog post"
                required
              />
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="image_url" className="block text-sm font-medium mb-2">
                Featured Image URL *
              </label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                placeholder="https://example.com/image.jpg"
                required
              />
              
              {/* Image Preview */}
              {formData.image_url && (
                <div className="mt-4">
                  {imageError ? (
                    <div className="border rounded-lg p-4 text-center">
                      <div className="text-4xl mb-2">❌</div>
                      <p className="text-sm">Failed to load image. Please check the URL.</p>
                    </div>
                  ) : imagePreview ? (
                    <div className="border rounded-lg overflow-hidden">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-2 text-sm text-center bg-gray-50">
                        Preview of featured image
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-4 text-center">
                      <div className="text-4xl mb-2">⏳</div>
                      <p className="text-sm">Loading image preview...</p>
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-sm mt-2 text-gray-600">
                Enter a direct URL to an image (jpg, png, gif, webp)
              </p>
            </div>

            {/* Content Editor */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-2">
                Content * (Markdown)
              </label>
              
              {/* Markdown Toolbar */}
              <div className="border border-b-0 rounded-t-lg px-4 py-2  flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => insertMarkdown('h1')}
                  className="px-3 py-1 text-sm border rounded "
                  title="Heading 1"
                >
                  H1
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('h2')}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-200 transition-colors"
                  title="Heading 2"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('h3')}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-200 transition-colors"
                  title="Heading 3"
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('bold')}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-200 transition-colors font-bold"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('italic')}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-200 transition-colors italic"
                  title="Italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('code')}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-200 transition-colors font-mono"
                  title="Inline Code"
                >
                  &lt;/&gt;
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('link')}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-200 transition-colors"
                  title="Link"
                >
                  🔗
                </button>
              </div>

              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={15}
                className="w-full px-4 py-3 border rounded-b-lg focus:ring-2 focus:border-transparent transition-colors resize-y font-mono text-sm"
                placeholder="Write your blog content in Markdown..."
                required
              />
              
              <div className="mt-2 text-sm">
                <details>
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800">Markdown Quick Reference</summary>
                  <div className="mt-2 p-3 bg-gray-50 rounded text-xs space-y-1">
                    <div><code># Heading 1</code></div>
                    <div><code>## Heading 2</code></div>
                    <div><code>### Heading 3</code></div>
                    <div><code>**bold text**</code></div>
                    <div><code>*italic text*</code></div>
                    <div><code>`inline code`</code></div>
                    <div><code>[link text](url)</code></div>
                  </div>
                </details>
              </div>
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                name="published"
                checked={formData.published}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="published" className="ml-3 text-sm font-medium">
                Publish immediately
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting 
                  ? (editingPost ? 'Updating...' : 'Creating...') 
                  : (editingPost ? 'Update Blog Post' : 'Create Blog Post')
                }
              </button>
              
              {editingPost && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel Edit
                </button>
              )}
              
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    title: '',
                    description: '',
                    content: '',
                    image_url: '',
                    slug: '',
                    published: false,
                  });
                  setImagePreview('');
                  setImageError(false);
                  setMessage(null);
                  setEditingPost(null);
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>
          </form>

          {/* Blog Posts List */}
          <div className="mt-12">
            <div className="px-8 py-6 border-t">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Existing Blog Posts</h2>
                <button
                  onClick={fetchBlogPosts}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="text-lg">Loading blog posts...</div>
                </div>
              ) : blogPosts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-lg mb-2">No blog posts found</div>
                  <p>Create your first blog post using the form above.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {blogPosts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">{post.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              post.published 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {post.published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-3 line-clamp-2">{post.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Slug: {post.slug}</span>
                            <span>•</span>
                            <span>Created: {new Date(post.created_at).toLocaleDateString()}</span>
                            {post.updated_at && post.updated_at !== post.created_at && (
                              <>
                                <span>•</span>
                                <span>Updated: {new Date(post.updated_at).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Featured Image Thumbnail */}
                        {post.image_url && (
                          <div className="ml-4 flex-shrink-0">
                            <img 
                              src={post.image_url} 
                              alt={post.title}
                              className="w-20 h-20 object-cover rounded-lg"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 mt-4 pt-4 border-t">
                        <button
                          onClick={() => handleEdit(post)}
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Preview
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBlogUpload;