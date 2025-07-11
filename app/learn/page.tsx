'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import supabase from '@/config/supabase'

export default function ViewTextChain() {
  const params = useParams()
  const slug = params?.slug as string
  const [blocks, setBlocks] = useState<string[]>([])

  useEffect(() => {
    if (!slug) return

    const fetchBlocks = async () => {
      const { data, error } = await supabase
        .from('text_blocks')
        .select('content')
        .eq('slug', slug)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setBlocks(data.map(b => b.content))
      }
    }

    fetchBlocks()
  }, [slug])

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold capitalize">{slug?.replace(/-/g, ' ')}</h1>
      {blocks.map((block, i) => (
        <div key={i} className="p-4 border rounded bg-white shadow">
          {block}
        </div>
      ))}
    </div>
  )
}
