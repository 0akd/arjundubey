// app/stats/[slug]/page.tsx
import supabase from '@/config/supabase'
import QuestionDetailClient from './QuestionDetailClient'

export default async function Page({ params }: { params: { slug: string } }) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (error || !data) {
    // Use notFound() or redirect('/404') if you want
    return <div>Not found</div>
  }

  return <QuestionDetailClient data={data} />
}
