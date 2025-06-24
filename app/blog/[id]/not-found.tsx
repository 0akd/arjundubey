import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center rounded-xl p-12">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold mb-4">
            Blog Post Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <div className="space-y-4">
            <Link 
              href="/blog"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              ← Back to Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}