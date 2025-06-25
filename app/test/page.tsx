export default function TestOGPage() {
  const testParams = new URLSearchParams({
    title: 'Test Blog Post Title',
    description: 'This is a test description for the OG image',
    author: 'Arjun Dubey',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=600&fit=crop'
  })

  const ogImageUrl = `/api/og?${testParams.toString()}`

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">OG Image Test</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Generated OG Image:</h2>
          <img 
            src={ogImageUrl} 
            alt="Generated OG Image" 
            className="border border-gray-300 rounded-lg max-w-full"
            style={{ maxWidth: '600px' }}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Direct URL:</h2>
          <a 
            href={ogImageUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all"
          >
            {ogImageUrl}
          </a>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Test Without Image:</h2>
          <img 
            src="/api/og?title=Test Without Background&description=No background image" 
            alt="OG Image without background" 
            className="border border-gray-300 rounded-lg max-w-full"
            style={{ maxWidth: '600px' }}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Parameters Used:</h2>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
            {JSON.stringify({
              title: 'Test Blog Post Title',
              description: 'This is a test description for the OG image',
              author: 'Arjun Dubey',
              image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=600&fit=crop'
            }, null, 2)}
          </pre>
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">Debugging Steps:</h3>
        <ol className="list-decimal list-inside space-y-1 text-yellow-700">
          <li>Check if the images above load correctly</li>
          <li>Click the direct URL to test the API endpoint</li>
          <li>Check browser console for any errors</li>
          <li>Check your Next.js server logs</li>
          <li>Verify your Next.js version supports ImageResponse</li>
        </ol>
      </div>
    </div>
  )
}