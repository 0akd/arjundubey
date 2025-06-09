import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from '@/types/blogs';

interface BlogCardProps {
  post: BlogPost;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  return (
    <Link href={`/blog/${post.id}`}>
      <div className="group cursor-pointer rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={post.image_url}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
            {post.title}
          </h3>
          
          <p className="text-sm leading-relaxed mb-4 line-clamp-3">
            {post.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs">
              {new Date(post.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            
            <span className="text-sm font-medium group-hover:text-blue-700 transition-colors duration-200">
              Read more →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;