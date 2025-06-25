import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'Blog Post'
    const description = searchParams.get('description') || ''
    const author = searchParams.get('author') || 'Arjun Dubey'
    const imageUrl = searchParams.get('image') || null
    
    // WhatsApp optimization parameters
    const width = parseInt(searchParams.get('width') || '1200')
    const height = parseInt(searchParams.get('height') || '630')
    const square = searchParams.get('square') === 'true'

    // Use square dimensions for better WhatsApp mobile support
    const finalWidth = square ? 1200 : width
    const finalHeight = square ? 1200 : height

    const response = new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: imageUrl 
              ? `url(${imageUrl})`
              : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Dark overlay for better text readability */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.7) 100%)',
              zIndex: 0,
            }}
          />
          
          {/* Main Content Container with enhanced background */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: square ? '60px 40px' : '80px 60px',
              maxWidth: square ? '90%' : '900px',
              zIndex: 2,
              position: 'relative',
              background: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '24px',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}
          >
            {/* Title with enhanced visibility */}
            <h1
              style={{
                fontSize: square 
                  ? (title.length > 40 ? '48px' : '58px')
                  : (title.length > 50 ? '56px' : '72px'),
                fontWeight: 'bold',
                color: '#ffffff',
                lineHeight: 1.1,
                marginBottom: square ? '24px' : '20px',
                textAlign: 'center',
                textShadow: '0 4px 12px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9)',
                maxWidth: '100%',
                wordWrap: 'break-word',
                hyphens: 'auto',
                background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
              }}
            >
              {square && title.length > 60 ? `${title.substring(0, 60)}...` : title}
            </h1>

            {/* Description with enhanced contrast */}
            {description && (
              <p
                style={{
                  fontSize: square ? '22px' : '26px',
                  color: '#e2e8f0',
                  lineHeight: 1.4,
                  marginBottom: square ? '32px' : '40px',
                  textAlign: 'center',
                  maxWidth: square ? '100%' : '700px',
                  textShadow: '0 3px 6px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.9)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {square && description.length > 100 
                  ? `${description.substring(0, 100)}...` 
                  : description.length > 120 
                    ? `${description.substring(0, 120)}...` 
                    : description
                }
              </p>
            )}

            {/* Author and Branding - Enhanced with better contrast */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: square ? '20px' : 'auto',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: square ? '12px 24px' : '16px 28px',
                  borderRadius: '50px',
                  backdropFilter: 'blur(16px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                }}
              >
                <div
                  style={{
                    width: square ? '40px' : '44px',
                    height: square ? '40px' : '44px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <span style={{ 
                    color: 'white', 
                    fontSize: square ? '18px' : '20px', 
                    fontWeight: 'bold',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  }}>
                    {author.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span
                  style={{
                    color: '#ffffff',
                    fontSize: square ? '20px' : '22px',
                    fontWeight: '600',
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                  }}
                >
                  {author}
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced decorative elements with better visibility */}
          <div
            style={{
              position: 'absolute',
              top: '30px',
              right: '30px',
              width: square ? '60px' : '80px',
              height: square ? '60px' : '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%)',
              opacity: 0.4,
              filter: 'blur(1px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '30px',
              left: '30px',
              width: square ? '45px' : '60px',
              height: square ? '45px' : '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.3) 0%, rgba(59, 130, 246, 0.3) 100%)',
              opacity: 0.4,
              filter: 'blur(1px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          />

          {/* Additional mobile-friendly elements with enhanced visibility */}
          {square && (
            <>
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '20px',
                  width: '4px',
                  height: '100px',
                  background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.4) 0%, rgba(147, 51, 234, 0.4) 100%)',
                  opacity: 0.5,
                  borderRadius: '2px',
                  boxShadow: '0 0 8px rgba(59, 130, 246, 0.3)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '20px',
                  width: '4px',
                  height: '100px',
                  background: 'linear-gradient(180deg, rgba(236, 72, 153, 0.4) 0%, rgba(59, 130, 246, 0.4) 100%)',
                  opacity: 0.5,
                  borderRadius: '2px',
                  boxShadow: '0 0 8px rgba(236, 72, 153, 0.3)',
                }}
              />
            </>
          )}
        </div>
      ),
      {
        width: finalWidth,
        height: finalHeight,
        headers: {
          // Critical headers for WhatsApp mobile compatibility
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'CDN-Cache-Control': 'public, max-age=31536000',
          'Vercel-CDN-Cache-Control': 'public, max-age=31536000',
          // WhatsApp-specific headers
          'X-Content-Type-Options': 'nosniff',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    )

    // Add additional headers to the response for better WhatsApp compatibility
    response.headers.set('Content-Type', 'image/png')
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    
    return response

  } catch (e: any) {
    console.error('OG Image generation error:', e.message)
    
    // Return a simple fallback image on error
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: 'white',
            fontSize: '48px',
            fontWeight: 'bold',
          }}
        >
          Blog Post
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000',
        },
      }
    )
  }
}