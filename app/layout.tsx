import './globals.css'  // Import your global CSS file
import { ThemeProvider } from 'next-themes'
import { cn } from "@/lib/utils";
import CursorTrailCanvas from "@/cursortrail/page";


import { lazy, Suspense } from 'react'
  const Nav = lazy(()=>import('./nav/page'))
  const Footr = lazy(()=>import('./footr/page'))
  const Llm = lazy(()=>import('./llm/page'))

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html suppressHydrationWarning>
      <head />
      <body><main    className={cn(
            "bg-transparent  bg-[radial-gradient(#2f7df4_1px,transparent_1px)] [background-size:16px_16px]",
           
          )}>
        <ThemeProvider> <CursorTrailCanvas className="pointer-events-none inset-0 -z-10 " /><Nav/>{children}<Llm/><Footr/></ThemeProvider></main>
      </body>
    </html>
  )
}
