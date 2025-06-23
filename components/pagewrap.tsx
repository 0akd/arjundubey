'use client'

import { ReactNode } from 'react'
import SmoothScrollProvider from './smooth'

interface PageWrapperProps {
  children: ReactNode
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <SmoothScrollProvider>
      {children}
    </SmoothScrollProvider>
  )
}