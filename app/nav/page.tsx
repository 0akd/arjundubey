"use client"
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'
import Eye from '@/views/page'
import Sidebar from './sidebar';

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
  <Eye />
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