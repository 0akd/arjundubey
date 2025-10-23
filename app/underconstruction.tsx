// components/UnderConstructionOverlay.tsx
'use client'

import { useEffect, useState } from 'react'

export default function UnderConstructionOverlay() {
  const [isVisible, setIsVisible] = useState(true)

  // Optional: Add a way to dismiss the overlay
  const handleDismiss = () => {
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
      
      {/* Under Construction Text */}
      <div className="relative bg-yellow-500/90 text-black px-6 py-4 rounded-lg shadow-2xl border-2 border-yellow-600 pointer-events-auto">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">🚧 Under Construction</h2>
          <p className="text-sm mb-3">This site is currently being updated</p>
          <button 
            onClick={handleDismiss}
            className="bg-black text-white px-4 py-1 rounded text-xs hover:bg-gray-800 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}