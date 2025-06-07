import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const CORRECT_PASSWORD = '000';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Server-side rate limiting (in production, use Redis or database)
const attemptStore = new Map<string, { count: number; resetTime: number }>();

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

function isRateLimited(clientIP: string): boolean {
  const now = Date.now();
  const attempts = attemptStore.get(clientIP);
  
  if (!attempts) {
    return false;
  }
  
  // Reset if time has passed
  if (now > attempts.resetTime) {
    attemptStore.delete(clientIP);
    return false;
  }
  
  return attempts.count >= 5;
}

function recordFailedAttempt(clientIP: string): void {
  const now = Date.now();
  const attempts = attemptStore.get(clientIP);
  
  if (!attempts || now > attempts.resetTime) {
    // First attempt or reset period has passed
    attemptStore.set(clientIP, {
      count: 1,
      resetTime: now + (30 * 1000) // 30 seconds
    });
  } else {
    // Increment existing attempts
    attemptStore.set(clientIP, {
      count: attempts.count + 1,
      resetTime: attempts.resetTime
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    
    // Check rate limiting
    if (isRateLimited(clientIP)) {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    const { password } = body;
    
    // Validate input
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }
    
    // Check password format
    if (!/^\d{3}$/.test(password)) {
      recordFailedAttempt(clientIP);
      return NextResponse.json(
        { success: false, error: 'Invalid password format' },
        { status: 400 }
      );
    }
    
    // Simulate constant-time comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(password, 'utf8'),
      Buffer.from(CORRECT_PASSWORD, 'utf8')
    );
    
    if (isValid) {
      // Clear any existing attempts for this IP
      attemptStore.delete(clientIP);
      
      // Create response with secure cookies
      const response = NextResponse.json({ success: true });
      
      // Set authentication cookies
      response.cookies.set('password_authenticated', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: SESSION_DURATION / 1000, // Convert to seconds
        path: '/'
      });
      
      response.cookies.set('password_auth_time', Date.now().toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: SESSION_DURATION / 1000,
        path: '/'
      });
      
      return response;
    } else {
      // Record failed attempt
      recordFailedAttempt(clientIP);
      
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }
    
  } catch (error) {
    console.error('Password auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Endpoint to check auth status
export async function GET(request: NextRequest) {
  const passwordAuth = request.cookies.get('password_authenticated');
  const authTime = request.cookies.get('password_auth_time');
  
  if (!passwordAuth || passwordAuth.value !== 'true' || !authTime) {
    return NextResponse.json({ authenticated: false });
  }
  
  // Check if auth has expired
  const authTimestamp = parseInt(authTime.value);
  const now = Date.now();
  
  if (now - authTimestamp > SESSION_DURATION) {
    // Auth expired
    const response = NextResponse.json({ authenticated: false, expired: true });
    response.cookies.delete('password_authenticated');
    response.cookies.delete('password_auth_time');
    return response;
  }
  
  return NextResponse.json({ 
    authenticated: true, 
    expiresAt: authTimestamp + SESSION_DURATION 
  });
}