'use client'
import React, { useEffect, useState } from 'react'
import supabase from '@/config/supabase'

export default function AdminTextManager() {
  const [entries, setEntries] = useState<any[]>([])
  const [editing, setEditing] = useState<{ id: string; content: string } | null>(null)

  const fetchEntries = async () => {
    const { data } = await supabase.from('text_blocks').select('*').order('created_at')
    if (data) setEntries(data)
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  const handleDelete = async (id: string) => {
    await supabase.from('text_blocks').delete().eq('id', id)
    fetchEntries()
  }

  const handleUpdate = async () => {
    if (editing) {
      await supabase.from('text_blocks').update({ content: editing.content }).eq('id', editing.id)
      setEditing(null)
      fetchEntries()
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Admin: Manage Text Blocks</h2>
      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="border p-4 rounded space-y-2">
            <div className="text-sm text-gray-500">Slug: {entry.slug}</div>
            {editing?.id === entry.id ? (
              <>
                <textarea
                  className="w-full border p-2"
                  value={editing.content}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                />
                <div className="flex gap-2">
                  <button onClick={handleUpdate} className="bg-green-500 text-white px-2 py-1 rounded">Save</button>
                  <button onClick={() => setEditing(null)} className="bg-gray-500 text-white px-2 py-1 rounded">Cancel</button>
                </div>
              </>
            ) : (
              <>
                <p>{entry.content}</p>
                <div className="flex gap-2">
                  <button onClick={() => setEditing({ id: entry.id, content: entry.content })} className="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
                  <button onClick={() => handleDelete(entry.id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
