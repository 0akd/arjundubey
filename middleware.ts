import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, redirectToHome, redirectToLogin } from "next-firebase-auth-edge";
import { clientConfig, serverConfig } from "./config/config";

const PUBLIC_PATHS = ['/register', '/login'];

export async function middleware(request: NextRequest) {
  try {
    return await authMiddleware(request, {
      loginPath: "/api/login",
      logoutPath: "/api/logout",
      apiKey: clientConfig.apiKey,
      cookieName: serverConfig.cookieName,
      cookieSignatureKeys: serverConfig.cookieSignatureKeys,
      cookieSerializeOptions: serverConfig.cookieSerializeOptions,
      serviceAccount: serverConfig.serviceAccount,
      handleValidToken: async ({ token, decodedToken }, headers) => {
        if (PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
          return redirectToHome(request);
        }

        return NextResponse.next({ request: { headers } });
      },
      handleInvalidToken: async (reason) => {
        if (process.env.NODE_ENV === 'development') {
          console.info('Missing or malformed credentials', { reason });
        }

        return redirectToLogin(request, {
          path: '/login',
          publicPaths: PUBLIC_PATHS
        });
      },
      handleError: async (error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('Unhandled authentication error', { error });
        }

        return redirectToLogin(request, {
          path: '/login',
          publicPaths: PUBLIC_PATHS
        });
      }
    });
  } catch (err) {
    console.error('Middleware crashed:', err);
    return redirectToLogin(request, {
      path: '/login',
      publicPaths: PUBLIC_PATHS
    });
  }
}