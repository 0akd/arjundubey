import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, redirectToHome, redirectToLogin } from "next-firebase-auth-edge";

const PUBLIC_PATHS = ['/register', '/login'];

export async function middleware(request: NextRequest) {
  try {
    // Define configuration inline to avoid import issues
    const config = {
      loginPath: "/api/login",
      logoutPath: "/api/logout",
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
      cookieName: process.env.AUTH_COOKIE_NAME!,
      cookieSignatureKeys: [
        process.env.AUTH_COOKIE_SIGNATURE_KEY_CURRENT!,
        process.env.AUTH_COOKIE_SIGNATURE_KEY_PREVIOUS!,
      ],
      cookieSerializeOptions: {
        httpOnly: true,
        secure: process.env.USE_SECURE_COOKIES === 'true',
        sameSite: 'lax' as const,
        maxAge: 12 * 60 * 60 * 24 * 1000, // twelve days
        path: '/',
      },
      serviceAccount: {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      },
      handleValidToken: async ({ token, decodedToken }: any, headers: any) => {
        if (PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
          return redirectToHome(request);
        }

        return NextResponse.next({
          request: {
            headers
          }
        });
      },
      handleInvalidToken: async (reason: any) => {
        console.info('Missing or malformed credentials', { reason });

        return redirectToLogin(request, {
          path: '/login',
          publicPaths: PUBLIC_PATHS
        });
      },
      handleError: async (error: any) => {
        console.error('Unhandled authentication error', { error });
        
        return redirectToLogin(request, {
          path: '/login',
          publicPaths: PUBLIC_PATHS
        });
      }
    };

    return await authMiddleware(request, config);
  } catch (error) {
    console.error('Middleware execution failed:', error);
    
    // Fallback behavior
    if (PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
      return NextResponse.next();
    }
    
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};