import './globals.css'  // Import your global CSS file
import { ThemeProvider } from 'next-themes'
import { cn } from "@/lib/utils";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head />
      <body><main    className={cn(
            "bg-transparent  bg-[radial-gradient(#2f7df4_1px,transparent_1px)] [background-size:16px_16px]",
           
          )}>
        <ThemeProvider>{children}</ThemeProvider></main>
      </body>
    </html>
  )
}
