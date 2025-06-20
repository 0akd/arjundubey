import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

interface NavigationItem {
  name: string;
  path: string;
  icon?: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems: NavigationItem[] = [
  { name: 'HOME', path: '/', icon: '🏠' },
  { name: 'DONATE', path: '/donate', icon: '💝' },
  { name: 'LOGIN', path: '/login', icon: '🔐' },
  { name: 'LOGOUT', path: '/logout', icon: '🚪' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Simple Overlay - no background effects */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Modern Sidebar with glass morphism - reduced width */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-screen w-64 z-50 
                   backdrop-blur-xl bg-gradient-to-b from-white/10 via-white/5 to-white/10
                   border-l border-white/20 shadow-2xl shadow-purple-500/10
                   transform transition-all duration-500 ease-out flex flex-col
                   ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Decorative top gradient line */}
        <div className="h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400" />

        {/* Enhanced Header with modern styling */}
        <div className="flex items-center justify-between p-2 flex-shrink-0 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-lg" />
          
          <div className="flex flex-col relative z-10">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs px-3 text-purple-300/70 font-medium tracking-wide">
                {"← light/dark mode"}
              </p>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 
                         transition-all duration-300 hover:scale-110 active:scale-95
                         border border-white/10 hover:border-purple-300/30"
                aria-label="Close sidebar"
              >
                <svg className="w-5 h-5 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <h2 className="text-xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 
                          bg-clip-text text-transparent tracking-tight">
              Welcome to AKDVerse
            </h2>
            
            {/* Animated subtitle */}
            <div className="flex items-center mt-1 space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-300/80 font-medium">Online & Ready</span>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation with modern cards - now scrollable */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent 
                      scrollbar-thumb-purple-500/30 hover:scrollbar-thumb-purple-500/50 
                      px-3 pb-4 space-y-3">
          <nav>
            {navigationItems.map((item, index) => (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Link
                  href={item.path}
                  className="block relative overflow-hidden rounded-xl
                           bg-gradient-to-r from-white/5 to-white/10
                           hover:from-purple-500/20 hover:to-blue-500/20
                           border border-white/10 hover:border-purple-300/30
                           backdrop-blur-sm shadow-lg hover:shadow-purple-500/20
                           transition-all duration-300 ease-out
                           transform hover:scale-[1.02] hover:-translate-y-1
                           active:scale-[0.98]"
                  onClick={onClose}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                               -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  
                  <div className="relative z-10 flex items-center p-3 space-x-3">
                    {item.icon && (
                      <span className="text-xl transform group-hover:scale-110 transition-transform duration-300">
                        {item.icon}
                      </span>
                    )}
                    
                    <div className="flex-1">
                      <span className="font-bold text-white/90 group-hover:text-white
                                     tracking-wide text-sm transition-colors duration-300">
                        {item.name}
                      </span>
                      
                      {/* Subtle accent line */}
                      <div className="h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 
                                    transform scale-x-0 group-hover:scale-x-100 
                                    transition-transform duration-300 origin-left mt-1" />
                    </div>
                    
                    {/* Arrow indicator */}
                    <svg className="w-4 h-4 text-purple-300/50 group-hover:text-purple-300 
                                   transform translate-x-0 group-hover:translate-x-1 
                                   transition-all duration-300" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </div>
            ))}
            
            {/* Additional placeholder items to demonstrate scrolling */}
            {[...Array(10)].map((_, index) => (
              <div
                key={`extra-${index}`}
                className="group relative"
              >
                <div className="block relative overflow-hidden rounded-xl
                             bg-gradient-to-r from-white/3 to-white/8
                             hover:from-purple-500/15 hover:to-blue-500/15
                             border border-white/5 hover:border-purple-300/20
                             backdrop-blur-sm transition-all duration-300 ease-out
                             transform hover:scale-[1.01] opacity-60">
                  <div className="relative z-10 flex items-center p-3 space-x-3">
                    <span className="text-lg">🔮</span>
                    <div className="flex-1">
                      <span className="font-medium text-white/60 tracking-wide text-sm">
                        FEATURE {index + 1}
                      </span>
                      <div className="text-xs text-purple-300/40 mt-0.5">Coming Soon</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Enhanced Footer with modern styling */}
        <div className="p-4 flex-shrink-0 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-t-lg" />
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 
                            flex items-center justify-center shadow-lg">
                <span className="text-white text-xs font-bold">AK</span>
              </div>
              
              <div>
                <div className="text-xs font-semibold text-white/80">Version 1.0.0</div>
                <div className="text-xs text-purple-300/60">Built with ❤️</div>
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 animate-pulse" />
              <span className="text-xs text-emerald-300/70 font-medium">Live</span>
            </div>
          </div>
        </div>

        {/* Decorative bottom gradient line */}
        <div className="h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400" />
      </div>
    </>
  );
};

export default Sidebar;