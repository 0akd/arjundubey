'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import supabase from '@/config/supabase'

type Question = {
  id: number
  title: string
  slug:string
}

export default function QuestionListPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
const grouped = questions.reduce((acc, q) => {
  if (!acc[q.category]) acc[q.category] = []
  acc[q.category].push(q)
  return acc
}, {} as Record<string, Question[]>)

useEffect(() => {
  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from('questions')
.select('id, title, slug, category')

      .order('id', { ascending: false })

    if (error) console.error('Fetch error:', error)
    else setQuestions(data || [])

    setLoading(false)
  }

  fetchQuestions()
}, [])


  if (loading) return <p className="text-center text-gray-500">Loading...</p>

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">All Questions</h1>
     {Object.entries(grouped).map(([cat, qs]) => (
  <div key={cat} className="mb-6">
    <h2 className="text-xl font-bold mb-2">{cat || 'Uncategorized'}</h2>
    <div className="space-y-2">
      {qs.map((q) => (
        <Link key={q.id} href={`/stats/${q.slug}`}>
          <div className="p-4 bg-white rounded shadow hover:bg-gray-100">
            <h3 className="font-semibold text-lg">{q.title}</h3>
          </div>
        </Link>
      ))}
    </div>
  </div>
))}

    </div>
  )
}
