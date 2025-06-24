export interface BlogPost {
  id: string
  title: string
  description: string
  content: string
  image_url: string
  published: boolean
  created_at: string
  updated_at?: string
  tags?: string[]
  author?: string
  slug?: string
}