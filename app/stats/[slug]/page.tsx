import supabase from '@/config/supabase'
import QuestionDetailClient from '@/components/QuestionDetailClient'
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: { slug: string } }) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (error || !data) {
    notFound()
  }

  return <QuestionDetailClient data={data} />
}
