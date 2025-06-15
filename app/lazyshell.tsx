'use client'

import { lazy, Suspense } from 'react'
import { ThemeProvider } from 'next-themes'

const Nav = lazy(() => import('./nav/page'))
const Footr = lazy(() => import('./footr/page'))
const Llm = lazy(() => import('./llm/page'))

export default function Lazyw({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Suspense fallback={null}>
        <Nav />
        {children}
        <Llm />
        <Footr />
      </Suspense>
    </ThemeProvider>
  )
}
