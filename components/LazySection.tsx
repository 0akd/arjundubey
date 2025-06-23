'use client'

import { Suspense } from 'react'
import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'

interface LazySectionProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  rootMargin?: string
  animationType?: 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scale' | 'blur'
  delay?: number
}

export default function LazySection({ 
  children, 
  fallback = (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
      />
    </div>
  ),
  rootMargin = "200px",
  animationType = 'fadeUp',
  delay = 0
}: LazySectionProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin,
    threshold: 0.1
  })

  // Animation variants for different types
  const variants = {
    fadeUp: {
      hidden: { 
        opacity: 0, 
        y: 60,
        filter: 'blur(4px)'
      },
      visible: { 
        opacity: 1, 
        y: 0,
        filter: 'blur(0px)',
        transition: {
          duration: 0.8,
          delay,
          ease: [0.25, 0.4, 0.25, 1] as const // Fix easing type
        }
      }
    },
    fadeIn: {
      hidden: { 
        opacity: 0,
        filter: 'blur(4px)'
      },
      visible: { 
        opacity: 1,
        filter: 'blur(0px)',
        transition: {
          duration: 0.6,
          delay,
          ease: "easeOut" as const
        }
      }
    },
    slideLeft: {
      hidden: { 
        opacity: 0, 
        x: -80,
        filter: 'blur(4px)'
      },
      visible: { 
        opacity: 1, 
        x: 0,
        filter: 'blur(0px)',
        transition: {
          duration: 0.7,
          delay,
          ease: [0.25, 0.4, 0.25, 1] as const
        }
      }
    },
    slideRight: {
      hidden: { 
        opacity: 0, 
        x: 80,
        filter: 'blur(4px)'
      },
      visible: { 
        opacity: 1, 
        x: 0,
        filter: 'blur(0px)',
        transition: {
          duration: 0.7,
          delay,
          ease: [0.25, 0.4, 0.25, 1] as const
        }
      }
    },
    scale: {
      hidden: { 
        opacity: 0, 
        scale: 0.8,
        filter: 'blur(4px)'
      },
      visible: { 
        opacity: 1, 
        scale: 1,
        filter: 'blur(0px)',
        transition: {
          duration: 0.6,
          delay,
          ease: [0.25, 0.4, 0.25, 1] as const
        }
      }
    },
    blur: {
      hidden: { 
        opacity: 0,
        filter: 'blur(10px)',
        scale: 1.02
      },
      visible: { 
        opacity: 1,
        filter: 'blur(0px)',
        scale: 1,
        transition: {
          duration: 0.8,
          delay,
          ease: "easeOut" as const
        }
      }
    }
  } as const

  return (
    <div ref={ref}>
      {inView ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={variants[animationType]}
          className="will-change-transform"
        >
          <Suspense fallback={fallback}>
            {children}
          </Suspense>
        </motion.div>
      ) : (
        <div className="min-h-[400px] opacity-0" /> // Placeholder with opacity 0 for smooth loading
      )}
    </div>
  )
}