"use client"
import { useTheme } from 'next-themes'
import { Sun, Moon, Stars, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react'

import Sidebar from './sidebar';

const ThemeChanger = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`
        group relative overflow-hidden
        p-2.5 rounded-xl
        transition-all duration-500 ease-out
        hover:scale-110 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isDark 
          ? 'bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 focus:ring-purple-400 focus:ring-offset-slate-900' 
          : 'bg-gradient-to-br from-orange-100 to-yellow-100 hover:from-orange-200 hover:to-yellow-200 focus:ring-orange-400 focus:ring-offset-white'
        }
        shadow-lg hover:shadow-xl
        ${isDark ? 'shadow-purple-500/20' : 'shadow-orange-500/20'}
      `}
    >
      {/* Animated background glow */}
      <div className={`
        absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
        transition-opacity duration-300
        ${isDark 
          ? 'bg-gradient-to-br from-purple-600/20 to-blue-600/20' 
          : 'bg-gradient-to-br from-yellow-300/30 to-orange-300/30'
        }
      `} />

      {/* Floating particles for enhanced visual appeal */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Light mode particles */}
        <div className={`
          absolute top-1 right-1 w-1 h-1 rounded-full
          transition-all duration-700
          ${isDark ? 'opacity-0 scale-0' : 'opacity-60 scale-100'}
          bg-orange-400 animate-pulse
        `} style={{animationDelay: '0s'}} />
        <div className={`
          absolute bottom-1 left-1 w-0.5 h-0.5 rounded-full
          transition-all duration-700
          ${isDark ? 'opacity-0 scale-0' : 'opacity-40 scale-100'}
          bg-yellow-500 animate-pulse
        `} style={{animationDelay: '0.5s'}} />

        {/* Dark mode stars */}
        <div className={`
          absolute top-1 left-1 w-0.5 h-0.5 rounded-full
          transition-all duration-700
          ${isDark ? 'opacity-80 scale-100' : 'opacity-0 scale-0'}
          bg-white animate-pulse
        `} style={{animationDelay: '0.2s'}} />
        <div className={`
          absolute bottom-1 right-1 w-1 h-1 rounded-full
          transition-all duration-700
          ${isDark ? 'opacity-60 scale-100' : 'opacity-0 scale-0'}
          bg-purple-300 animate-pulse
        `} style={{animationDelay: '0.8s'}} />
      </div>

      {/* Main icon container */}
      <div className="relative w-5 h-5">
        {/* Sun Icon */}
        <Sun 
          className={`
            absolute inset-0 w-5 h-5
            transition-all duration-600 ease-in-out
            ${isDark 
              ? 'rotate-90 scale-0 opacity-0 translate-y-1' 
              : 'rotate-0 scale-100 opacity-100 translate-y-0'
            }
            ${isDark ? 'text-gray-400' : 'text-orange-600'}
            drop-shadow-sm
            group-hover:drop-shadow-md
          `}
        />
        
        {/* Moon Icon */}
        <Moon 
          className={`
            absolute inset-0 w-5 h-5
            transition-all duration-600 ease-in-out
            ${isDark 
              ? 'rotate-0 scale-100 opacity-100 translate-y-0' 
              : '-rotate-90 scale-0 opacity-0 translate-y-1'
            }
            ${isDark ? 'text-purple-300' : 'text-slate-400'}
            drop-shadow-sm
            group-hover:drop-shadow-md
          `}
        />
      </div>

      {/* Subtle rotating ring effect */}
      <div className={`
        absolute inset-0 rounded-xl border-2 border-transparent
        transition-all duration-500
        group-hover:border-current group-hover:rotate-180
        ${isDark ? 'group-hover:border-purple-400/30' : 'group-hover:border-orange-400/30'}
      `} />

      {/* Micro-interaction feedback dot */}
      <div className={`
        absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full
        transition-all duration-300 scale-0 group-active:scale-100
        ${isDark ? 'bg-purple-400' : 'bg-orange-400'}
      `} />
    </button>
  )
}

export default function NavBar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div className="h-16 invisible"></div>
      <nav 
        className="fixed top-0 left-0 w-full z-50 backdrop-blur-sm bg-opacity-10 px-4 py-3 transition-colors duration-300"
        style={{
          background: `radial-gradient(#2f7df4 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
          backgroundPosition: `0px ${-scrollY * 1}px`
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Theme toggle on the left */}
          <div className="flex-shrink-0">
            <ThemeChanger />
          </div>
          
          {/* Brand name in the center */}
       {/* Brand name in the center */}
<div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">

<a href="/organise">
  <h1 className="text-xl font-bold tracking-tight">
    arjundubey.com
  </h1>
</a>


</div>
          
          {/* Sidebar toggle on the right */}
          <div className="flex-shrink-0">
            <button
              onClick={toggleSidebar}
              className="z-20 p-2 rounded-md  transition-colors duration-200"
              aria-label="Toggle sidebar"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <div className={`w-5 h-0.5 transition-all duration-300 ${isSidebarOpen ? 'rotate-45 translate-y-1.5' : 'mb-1'}`} style={{ backgroundColor: 'currentColor' }} />
                <div className={`w-5 h-0.5 transition-all duration-300 ${isSidebarOpen ? 'opacity-0' : 'mb-1'}`} style={{ backgroundColor: 'currentColor' }} />
                <div className={`w-5 h-0.5 transition-all duration-300 ${isSidebarOpen ? '-rotate-45 -translate-y-1.5' : ''}`} style={{ backgroundColor: 'currentColor' }} />
              </div>
            </button>
          </div>
          
          {/* Sidebar */}
         
        </div>
      </nav>
       <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
    </>
  )
}