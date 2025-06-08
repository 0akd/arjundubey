"use client"
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

const ThemeChanger = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === 'light'

  return (
    <button
      onClick={() => setTheme(isDark ? 'dark' : 'light')}
      className="relative p-2 rounded-full  transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={`absolute inset-0 w-5 h-5  transition-all duration-500 ${
            isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`} 
        />
        <Moon 
          className={`absolute inset-0 w-5 h-5 transition-all duration-500 ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          }`} 
        />
      </div>
    </button>
  )
}

export default function NavBar() {
  return (
    <nav className="w-full   border-b  px-4 py-3 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Theme toggle on the left */}
        <div className="flex-shrink-0">
          <ThemeChanger />
        </div>
        
        {/* Brand name in the center */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-xl font-bold  tracking-tight">
            arjundubey.com
          </h1>
        </div>
        
        {/* Empty div for layout balance */}
        <div className="flex-shrink-0 w-9 h-9"></div>
      </div>
    </nav>
  )
}