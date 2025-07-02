"use client"
import { cn } from "@/lib/utils";

import {
  Briefcase,
  FolderGit2,
  GraduationCap,
  HomeIcon,
  LightbulbIcon,
  Mail,
  MoreHorizontal,
  User,
} from 'lucide-react';

import { Dock, DockIcon, DockItem, DockLabel } from './docl';

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import FramerWrapper from "./framer";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const data = [
    {
      title: 'Home',
      icon: (
        <HomeIcon className='h-full w-full ' />
      ),
      href: '/',
    },
    {
      title: 'About',
      icon: (
        <User className='h-full w-full ' />
      ),
      href: '/about',
    },
    {
      title: 'Skills',
      icon: (
        <LightbulbIcon className='h-full w-full ' />
      ),
      href: '/skills',
    },
    {
      title: 'Education',
      icon: (
        <GraduationCap className='h-full w-full ' />
      ),
      href: '/education',
    },
    {
      title: 'Projects',
      icon: (
        <FolderGit2 className='h-full w-full ' />
      ),
      href: '/projects',
    },
    {
      title: 'Contact us',
      icon: (
        <Mail className='h-full w-full ' />
      ),
      href: '/contact',
    },
    {
      title: 'More',
      icon: (
        <MoreHorizontal className='h-full w-full ' />
      ),
      href: '/more',
    },
  ];

  const [scrolling, setScrolling] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Fast navigation handler
  const handleNavigation = useCallback((href: string) => {
    if (pathname === href) return; // Don't navigate if already on the page
    
    setIsNavigating(true);
    
    // Use replace for instant navigation, or push for history
    router.push(href);
    
    // Reset navigation state after a short delay
    setTimeout(() => setIsNavigating(false), 100);
  }, [router, pathname]);

  // Prefetch all routes on component mount for instant navigation
  useEffect(() => {
    data.forEach((item) => {
      router.prefetch(item.href);
    });
  }, [router]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setScrolling(true);
      } else {
        setScrolling(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={`fixed bottom-2 sm:top-5 right-0 left-0 px-2 sm:px-5 m-auto w-full sm:w-fit bg-transparent z-[+9999999] `}>
      <Dock 
        className='items-end pb-2 sm:pb-3 rounded-full'
        magnification={60} // Reduced from default 80
        distance={120} // Reduced from default 150
        panelHeight={48} // Reduced from default 64
      >
        {data.map((item, idx) => (
          <div 
            key={idx}
            onClick={() => handleNavigation(item.href)}
            onTouchStart={() => {}} // Enable touch events
            onTouchEnd={(e: React.TouchEvent) => {
              e.preventDefault();
              handleNavigation(item.href);
            }}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleNavigation(item.href);
              }
            }}
            className="cursor-pointer touch-manipulation select-none"
            tabIndex={0}
            role="button"
            aria-label={`Navigate to ${item.title}`}
          >
            <DockItem
              className={cn(
                "aspect-square rounded-full bg-gray-200 dark:bg-neutral-800 transition-all duration-100 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12",
                pathname === item.href && "bg-gray-100 !border !border-primary-sky",
                isNavigating && "opacity-75"
              )}
            >
              <DockLabel>{item.title}</DockLabel>
              <DockIcon className={cn(pathname === item.href && "text-[#2f7df4]")}>
                {item.icon}
              </DockIcon>
            </DockItem>
          </div>
        ))}
      </Dock>
    </div>
  );
};

export default Navbar;