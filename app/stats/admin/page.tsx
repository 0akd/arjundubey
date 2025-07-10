'use client'
import { useState, useEffect } from 'react'
import supabase from '@/config/supabase'

type Question = {
  id: number
  title: string
    youtube_url?: string
  content: string
}

export default function QuestionManager() {
  const [title, setTitle] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState('')
const [codeBlocks, setCodeBlocks] = useState<string[]>([''])
const [category, setCategory] = useState('')


const [content, setContent] = useState('')
const [youtubeUrl, setYoutubeUrl] = useState('')
  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('id', { ascending: false })

    if (error) console.error('Fetch error:', error)
    else setQuestions(data || [])
  }
 



function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // remove non-word chars
    .replace(/\s+/g, '-')     // replace spaces with dashes
    .trim()
}

  useEffect(() => {
    fetchQuestions()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
const urls = youtubeUrl
  .split(',')
  .map((url) => url.trim())
  .filter((url) => url);
 const slug = slugify(title)
if (editId !== null) {
  await supabase
    .from('questions')
    .update({ title, content, youtube_url: urls, slug, code ,code_blocks: codeBlocks,category})
    .eq('id', editId)
} else {
  await supabase
    .from('questions')
    .insert([{ title, content, youtube_url: urls, slug, code,code_blocks: codeBlocks ,category}])
}


    setTitle('')
    setEditId(null)
    await fetchQuestions()
    setLoading(false)
  }

  const handleDelete = async (id: number) => {
    const confirm = window.confirm('Delete this question?')
    if (!confirm) return

    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id)

    if (error) console.error('Delete error:', error)
    else fetchQuestions()
  }

const startEdit = (question: Question) => {
  setTitle(question.title)
  setContent(question.content)
  setEditId(question.id)
  const youtubeUrls = Array.isArray(question.youtube_url)
  ? question.youtube_url
  : typeof question.youtube_url === 'string'
  ? question.youtube_url.split(',').map((url) => url.trim())
  : []

setYoutubeUrl(youtubeUrls.join(', '))

  setCode(question.code || '')
setCodeBlocks(question.code_blocks || [''])
setCategory(question.category || '')



}
  return (
    <div className="max-w-xl mx-auto p-4">
   <form onSubmit={handleSubmit} className="mb-4 space-y-2">
    <input
  type="text"
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  className="w-full px-3 py-2 border rounded"
  placeholder="Enter category (e.g. Algorithms, Math, JS)"
/>

  <input
    type="text"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    className="w-full px-3 py-2 border rounded"
    placeholder="Enter question title"
  />
  <textarea
  
    value={content}
    onChange={(e) => setContent(e.target.value)}
    className="w-full px-3 py-2 border rounded"
    placeholder="Enter question content"
    rows={8}
  />
  <textarea
  value={code}
  onChange={(e) => setCode(e.target.value)}
  className="w-full px-3 py-2 border rounded font-mono"
  placeholder="Enter code (optional)"
  rows={8}
/>


<input
  type="text"
  value={youtubeUrl}
  onChange={(e) => setYoutubeUrl(e.target.value)}
  className="w-full px-3 py-2 border rounded"
  placeholder="YouTube URLs (comma-separated)"
/>
<div className="space-y-2">
  <label className="font-semibold">Code Examples</label>
  {codeBlocks.map((block, index) => (
    <textarea
      key={index}
      value={block}
      onChange={(e) => {
        const newBlocks = [...codeBlocks]
        newBlocks[index] = e.target.value
        setCodeBlocks(newBlocks)
      }}
      className="w-full px-3 py-2 border rounded font-mono"
      placeholder={`Code block #${index + 1}`}
      rows={6}
    />
  ))}

  <button
    type="button"
    onClick={() => setCodeBlocks([...codeBlocks, ''])}
    className="bg-gray-200 text-sm px-3 py-1 rounded hover:bg-gray-300"
  >
    + Add another code block
  </button>
</div>


  <button
    type="submit"
    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
  >
    {editId ? 'Update' : 'Add'}
  </button>
</form>

      <div className="space-y-2">
        {questions.length === 0 ? (
          <p className="text-gray-500">No questions yet.</p>
        ) : (
          questions.map((q) => (
            <div
              key={q.id}
              className="flex justify-between items-center p-3 bg-gray-100 rounded shadow-sm"
            >
              <span>{q.title}</span>
              <div className="space-x-2">
                <button
                  onClick={() => startEdit(q)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
