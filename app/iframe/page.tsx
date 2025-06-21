"use client"

import React, { useEffect, useRef, useState } from 'react'
import { AlertCircle, ExternalLink, Loader2 } from 'lucide-react'

interface ImprovedIframeProps {
  targetUrl?: string
}

export default function ImprovedIframe({ targetUrl = 'https://dtu.ac.in' }: ImprovedIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentMethod, setCurrentMethod] = useState(0)

  // List of working proxy services (you'll need to find active ones)
  const proxyServices = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://proxy.corsfix.com/?',
    'https://cors.x2u.in/',
    'https://codetabs.com/cors-proxy/cors-proxy.html',
    'https://test.cors.workers.dev/?',
    'https://yacdn.org/proxy/',
    'https://cloudflare-cors-anywhere.herokuapp.com/',
    'https://thebugging.com/cors/'
  ]

  useEffect(() => {
    loadWithFallback()
  }, [targetUrl, currentMethod])

  const loadWithFallback = async () => {
    if (!iframeRef.current) return
    setIsLoading(true)
    setError(null)

    const methods = [
      // Method 1: Try direct iframe first
      () => targetUrl,
      // Method 2: Try with proxy
      () => {
        if (proxyServices[currentMethod % proxyServices.length]) {
          return proxyServices[currentMethod % proxyServices.length] + encodeURIComponent(targetUrl)
        }
        return targetUrl
      },
      // Method 3: Create a simple proxy page
      () => {
        const proxyHtml = `
          <!DOCTYPE html>
          <html>
            <head><title>Proxy Frame</title></head>
            <body>
              <h3>Proxy Frame</h3>
              <p>The requested website cannot be embedded due to security restrictions.</p>
              <p>Target URL: ${targetUrl}</p>
              <a href="${targetUrl}" target="_blank" rel="noopener noreferrer">Open in New Tab</a>
            </body>
          </html>
        `
        const blob = new Blob([proxyHtml], { type: 'text/html' })
        return URL.createObjectURL(blob)
      }
    ]

    try {
      const url = methods[Math.min(currentMethod, methods.length - 1)]()
      if (iframeRef.current) {
        iframeRef.current.src = url
      }
    } catch (err) {
      setError('Failed to load content')
      setIsLoading(false)
    }
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
    setError(null)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    if (currentMethod < 2) {
      setTimeout(() => {
        setCurrentMethod(prev => prev + 1)
      }, 1000)
    } else {
      setError('Content cannot be embedded due to security restrictions')
    }
  }

  const openInNewTab = () => {
    window.open(targetUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="relative">
      <div className="mb-2 flex items-center justify-between">
        <div className="inline-flex items-center gap-2">
          <span>Loading:</span>
          <span className="font-mono text-sm">{targetUrl}</span>
        </div>
        <button
          onClick={openInNewTab}
          className="inline-flex items-center gap-1 rounded bg-gray-100 p-1 px-2 text-sm hover:bg-gray-200"
        >
          <ExternalLink size={16} />
          <span>Open External</span>
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-2 flex items-start gap-2 rounded border border-red-200 bg-red-50 p-2 text-red-700">
          <AlertCircle size={16} />
          <div>
            <p className="font-medium">Cannot embed this website</p>
            <p>{error}. This is a security feature that prevents websites from being embedded in frames.</p>
            <button onClick={openInNewTab} className="mt-1 text-sm underline">
              Click here to open in a new tab instead
            </button>
          </div>
        </div>
      )}

      {/* Main iframe */}
      <iframe
        ref={iframeRef}
        className="h-[70vh] w-full rounded border"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        title="Embedded content"
      />

      {/* Loading overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded border bg-white/70">
          <Loader2 size={24} className="animate-spin" />
          <span>Loading content...</span>
          <span className="text-sm text-gray-600">
            Method {currentMethod + 1} of 3
          </span>
        </div>
      )}
    </div>
  )
}
