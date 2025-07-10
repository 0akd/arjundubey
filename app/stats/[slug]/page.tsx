import supabase from '@/config/supabase'
import QuestionDetailClient from '@/components/QuestionDetailClient'
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  // Await the params promise
  const { slug } = await params
  
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    notFound()
  }

  return <QuestionDetailClient data={data} />
}