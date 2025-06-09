export interface BlogPost {
  id: string;
  title: string;
  description: string;
  content: string; // markdown content
  image_url: string;
  slug: string;
  created_at: string;
  updated_at: string;
  published: boolean;
}