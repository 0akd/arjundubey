'use client'
import { lazy, Suspense } from 'react'

const Nav = lazy(() => import('./nav/page'))
const Footr = lazy(() => import('./footr/page'))
const Llm = lazy(() => import('./llm/page'))

export default function LazyShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <Nav />
      {children}
      <Llm />
      <Footr />
    </Suspense>
  )
}
