'use client'
import React, { useState } from 'react'
import supabase from '@/config/supabase'

export default function UploadChain() {
  const [slug, setSlug] = useState('')
  const [blocks, setBlocks] = useState([''])

  const handleAddBlock = () => setBlocks([...blocks, ''])
  const handleBlockChange = (index: number, value: string) => {
    const updated = [...blocks]
    updated[index] = value
    setBlocks(updated)
  }

  const handleSubmit = async () => {
    if (!slug || blocks.some(b => !b.trim())) {
      alert('Fill in all fields')
      return
    }

    const { error } = await supabase
      .from('text_blocks')
      .insert(blocks.map(content => ({ slug, content })))

    if (error) alert('Upload failed')
    else {
      alert('Uploaded!')
      setSlug('')
      setBlocks([''])
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded max-w-xl mx-auto">
      <h2 className="text-xl font-bold">Upload Text Block Chain</h2>
      <input
        className="w-full p-2 border rounded"
        placeholder="Enter slug (e.g. intro-to-ai)"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />
      {blocks.map((block, i) => (
        <textarea
          key={i}
          className="w-full p-2 border rounded"
          placeholder={`Block ${i + 1}`}
          value={block}
          onChange={(e) => handleBlockChange(i, e.target.value)}
        />
      ))}
      <div className="flex gap-2">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleAddBlock}>
          + Add Block
        </button>
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleSubmit}>
          Upload
        </button>
      </div>
    </div>
  )
}
