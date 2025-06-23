'use client'

import { useEffect } from 'react'

export default function SmoothScrollStyles() {
  useEffect(() => {
    // Add smooth scrolling styles to the document
    const style = document.createElement('style')
    style.textContent = `
      html {
        scroll-behavior: smooth;
        scroll-padding-top: 2rem;
      }
      
      /* Custom scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
      
      /* Smooth scrolling for better UX */
      * {
        scroll-behavior: smooth;
      }
      
      /* Reduce motion for users who prefer it */
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }
    `
    
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return null
}