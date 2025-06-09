import BlogPostComponent from '@/components/blogpost';

interface BlogPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { id } = await params;
  
  return <BlogPostComponent postId={id} />;
}