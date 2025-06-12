'use client'

import { useState, useEffect } from 'react'
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "@/firebase";
import supabase from '@/config/supabase'

interface Website {
  id: string
  url: string
  created_at: string
}

export default function WebsiteCollector() {
  const [url, setUrl] = useState('')
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editUrl, setEditUrl] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const AUTHORIZED_EMAIL = 'reboostify@gmail.com'
  const auth = getAuth(app)

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setAuthLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Fetch websites on component mount
  useEffect(() => {
    if (!authLoading) {
      fetchWebsites()
    }
  }, [authLoading])

  const isAuthorized = () => {
    return user?.email === AUTHORIZED_EMAIL
  }

  const fetchWebsites = async () => {
    try {
      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setWebsites(data || [])
    } catch (err) {
      console.error('Error fetching websites:', err)
      setError('Failed to fetch websites')
    }
  }

  const addWebsite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim() || !isAuthorized()) return

    setLoading(true)
    setError('')

    try {
      // Add https:// if not present
      let formattedUrl = url.trim()
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'https://' + formattedUrl
      }

      const { data, error } = await supabase
        .from('websites')
        .insert([{ url: formattedUrl }])
        .select()

      if (error) throw error

      // Add to local state
      if (data) {
        setWebsites([data[0], ...websites])
      }

      setUrl('')
    } catch (err) {
      console.error('Error adding website:', err)
      setError('Failed to add website')
    } finally {
      setLoading(false)
    }
  }

  const deleteWebsite = async (id: string, url: string) => {
    if (!isAuthorized()) return

    // Show confirmation alert
    const confirmed = window.confirm(`Are you sure you want to delete "${url}"?`)
    if (!confirmed) return

    try {
      const { error } = await supabase
        .from('websites')
        .delete()
        .eq('id', id)

      if (error) throw error

      setWebsites(websites.filter(website => website.id !== id))
    } catch (err) {
      console.error('Error deleting website:', err)
      setError('Failed to delete website')
    }
  }

  const startEdit = (id: string, currentUrl: string) => {
    if (!isAuthorized()) return
    setEditingId(id)
    setEditUrl(currentUrl)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditUrl('')
  }

  const saveEdit = async (id: string) => {
    if (!editUrl.trim() || !isAuthorized()) return

    try {
      // Add https:// if not present
      let formattedUrl = editUrl.trim()
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'https://' + formattedUrl
      }

      const { error } = await supabase
        .from('websites')
        .update({ url: formattedUrl })
        .eq('id', id)

      if (error) throw error

      // Update local state
      setWebsites(websites.map(website => 
        website.id === id ? { ...website, url: formattedUrl } : website
      ))

      setEditingId(null)
      setEditUrl('')
    } catch (err) {
      console.error('Error updating website:', err)
      setError('Failed to update website')
    }
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 flex justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  // Show unauthorized message
  if (!isAuthorized()) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Access Restricted</h2>
          <p className="opacity-70">
            {user ? 
              `You are signed in as ${user.email}, but only reboostify@gmail.com can manage websites.` : 
              'Please sign in with the authorized email to manage websites.'
            }
          </p>
        </div>
        
        {/* Still show websites in read-only mode */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Saved Websites ({websites.length})</h3>
          
          {websites.length === 0 ? (
            <p className="opacity-60 text-center py-8">No websites saved yet</p>
          ) : (
            <div className="space-y-2">
              {websites.map((website) => (
                <div
                  key={website.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <button
                    onClick={() => window.open(website.url, '_blank')}
                    className="flex-1 text-left truncate underline"
                    title={website.url}
                  >
                    {website.url}
                  </button>
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-xs opacity-50">
                      {new Date(website.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        {/* <h2 className="text-2xl font-bold">Website Collector</h2>
        <p className="opacity-70">Save and organize your favorite websites</p> */}
      </div>

      <form onSubmit={addWebsite} className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL..."
            className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-2"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </form>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Saved Websites ({websites.length})</h3>
        
        {websites.length === 0 ? (
          <p className="opacity-60 text-center py-8">No websites saved yet</p>
        ) : (
          <div className="space-y-2">
            {websites.map((website) => (
              <div
                key={website.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                {editingId === website.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="flex-1 px-2 py-1 rounded border focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => saveEdit(website.id)}
                      className="px-3 py-1 text-sm rounded bg-green-500 text-white"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 text-sm rounded bg-gray-500 text-white"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => window.open(website.url, '_blank')}
                    className="flex-1 text-left truncate underline"
                    title={website.url}
                  >
                    {website.url}
                  </button>
                )}
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-xs opacity-50">
                    {new Date(website.created_at).toLocaleDateString()}
                  </span>
                  {editingId !== website.id && (
                    <>
                      <button
                        onClick={() => startEdit(website.id, website.url)}
                        className="px-2 py-1 text-sm rounded bg-blue-500 text-white"
                        title="Edit website"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteWebsite(website.id, website.url)}
                        className="px-2 py-1 text-sm rounded bg-red-500 text-white"
                        title="Delete website"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}