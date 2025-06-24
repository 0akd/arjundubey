import { Metadata } from 'next'
import AboutClient from './AboutClient'

// This is a Server Component - metadata export is allowed here
export const metadata: Metadata = {
  title: 'About - Arjun Dubey',
  description: 'Learn more about Arjun Dubey - Software Developer specializing in ReactJS, NextJS, SolidJS, JavaScript, HTML and CSS',
  openGraph: {
    title: 'About - Arjun Dubey',
    description: 'Learn more about Arjun Dubey - Software Developer specializing in ReactJS, NextJS, SolidJS, JavaScript, HTML and CSS',
    images: ['/images/arjun.png'],
  },
}

// Server Component that renders the Client Component
export default function AboutPage() {
  return <AboutClient />
}