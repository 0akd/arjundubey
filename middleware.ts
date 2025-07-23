import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, redirectToHome, redirectToLogin } from "next-firebase-auth-edge";
import { clientConfig, serverConfig } from "./config/config";

const PUBLIC_PATHS = ['/test',"/privacy",'/resume','/products','/learn','/reality','/register','/iframe','/music','/leetcode','/word','/display','/donate', '/login','/views', '/organise','/progress', '/blog','/about','/projects','/','/education','/stats','/logout','/rout','/footr','/webby','/admin/blog'];
const AUTH_REQUIRED_PATHS = ['/organise']; // Add your protected routes here
const PASSWORD_PROTECTED_PATHS = ['']; // Routes that need password protection
const PASSWORD_AUTH_PATH = '/password-auth';

// Define path prefixes that should be completely excluded from any protection
const EXCLUDED_PATH_PREFIXES = ['/stats/', '/blog/','/learn/','/resume/'];

// Helper function to check if a path should be excluded
function isExcludedPath(pathname: string): boolean {
  return EXCLUDED_PATH_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

// Password protection logic
function checkPasswordAuth(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname;
  
  // Skip password check for excluded paths
  if (isExcludedPath(pathname)) {
    return null;
  }
  
  // Skip password check for public paths, auth endpoints, and password auth page itself
  if (PUBLIC_PATHS.includes(pathname) || 
      pathname.startsWith('/api/') || 
      pathname === PASSWORD_AUTH_PATH) {
    return null;
  }
  
  // Check if this path requires password protection
  const requiresPassword = PASSWORD_PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path)
  );
  
  if (requiresPassword) {
    // Check for password auth cookie
    const passwordAuthCookie = request.cookies.get('password_authenticated');
    const passwordAuthTime = request.cookies.get('password_auth_time');
    
    if (!passwordAuthCookie || passwordAuthCookie.value !== 'true') {
      // Redirect to password auth page
      const url = new URL(PASSWORD_AUTH_PATH, request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    
    // Check if password auth has expired (24 hours)
    if (passwordAuthTime) {
      const authTime = parseInt(passwordAuthTime.value);
      const now = Date.now();
      const twentyFourHours = 3600*1000;
      
      if (now - authTime > twentyFourHours) {
        // Password auth expired, redirect to password auth page
        const url = new URL(PASSWORD_AUTH_PATH, request.url);
        url.searchParams.set('redirect', pathname);
        const response = NextResponse.redirect(url);
        
        // Clear expired cookies
        response.cookies.delete('password_authenticated');
        response.cookies.delete('password_auth_time');
        
        return response;
      }
    }
  }
  
  return null;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip all middleware for excluded paths
  if (isExcludedPath(pathname)) {
    return NextResponse.next();
  }
  
  // First check password protection
  const passwordAuthResponse = checkPasswordAuth(request);
  if (passwordAuthResponse) {
    return passwordAuthResponse;
  }
  
  // Handle password auth endpoint separately (bypass Firebase auth)
  if (pathname === PASSWORD_AUTH_PATH) {
    return NextResponse.next();
  }
  
  // Then proceed with Firebase auth middleware
  return authMiddleware(request, {
    loginPath: "/api/login",
    logoutPath: "/api/logout",
    apiKey: clientConfig.apiKey,
    cookieName: serverConfig.cookieName,
    cookieSignatureKeys: serverConfig.cookieSignatureKeys,
    cookieSerializeOptions: serverConfig.cookieSerializeOptions,
    serviceAccount: serverConfig.serviceAccount,
    handleValidToken: async ({token, decodedToken}, headers) => {
      // Redirect authenticated users away from auth pages only
      if (['/login', '/register'].includes(pathname)) {
        return redirectToHome(request);
      }

      // Allow access to all other pages
      return NextResponse.next({
        headers
      });
    },
    handleInvalidToken: async (reason) => {
      console.info('Missing or malformed credentials', {reason});

      return redirectToLogin(request, {
        path: '/login',
        publicPaths: PUBLIC_PATHS
      });
    },
    handleError: async (error) => {
      console.error('Unhandled authentication error', {error});
      
      return redirectToLogin(request, {
        path: '/login',
        publicPaths: PUBLIC_PATHS
      });
    }
  });
}

export const config = {
  matcher: [
    "/",
    "/((?!_next|api|.*\\.).*)",
    "/api/login",
    "/api/logout",
    "/password-auth", // Add password auth route to matcher
  ],
};