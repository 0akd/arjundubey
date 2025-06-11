'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Separate component for the search params logic
function PasswordAuthContent() {
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [devToolsDetected, setDevToolsDetected] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const MAX_ATTEMPTS = 5;
  const BLOCK_DURATION = 60; // Increased to 60 seconds

  // Enhanced dev tools detection
  useEffect(() => {
    let devtools = false;
    
    const detectDevTools = () => {
      const start = performance.now();
      debugger; // This will pause if dev tools are open
      const end = performance.now();
      
      if (end - start > 100) {
        devtools = true;
        setDevToolsDetected(true);
      }
    };

    // Check periodically
    const devToolsInterval = setInterval(detectDevTools, 1000);

    // Monitor console
    const originalConsole = console.log;
    console.log = (...args) => {
      setDevToolsDetected(true);
      originalConsole.apply(console, args);
    };

    // Monitor window size changes (common when opening dev tools)
    const checkWindowSize = () => {
      if (window.outerHeight - window.innerHeight > 200 || 
          window.outerWidth - window.innerWidth > 200) {
        setDevToolsDetected(true);
      }
    };

    window.addEventListener('resize', checkWindowSize);

    return () => {
      clearInterval(devToolsInterval);
      console.log = originalConsole;
      window.removeEventListener('resize', checkWindowSize);
    };
  }, []);

  // Check if user is currently blocked
  useEffect(() => {
    const blockEndTime = sessionStorage.getItem('pw_block_end');
    const failedAttempts = sessionStorage.getItem('pw_failed_attempts');
    
    if (blockEndTime) {
      const now = Date.now();
      const endTime = parseInt(blockEndTime);
      
      if (now < endTime) {
        setIsBlocked(true);
        setTimeRemaining(Math.ceil((endTime - now) / 1000));
        
        intervalRef.current = setInterval(() => {
          const remaining = Math.ceil((endTime - Date.now()) / 1000);
          if (remaining <= 0) {
            setIsBlocked(false);
            setTimeRemaining(0);
            setAttempts(0);
            sessionStorage.removeItem('pw_block_end');
            sessionStorage.removeItem('pw_failed_attempts');
            if (intervalRef.current) clearInterval(intervalRef.current);
          } else {
            setTimeRemaining(remaining);
          }
        }, 1000);

        return () => {
          if (intervalRef.current) clearInterval(intervalRef.current);
        };
      } else {
        sessionStorage.removeItem('pw_block_end');
        sessionStorage.removeItem('pw_failed_attempts');
      }
    }

    if (failedAttempts) {
      setAttempts(parseInt(failedAttempts));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission is now handled automatically in handleInputChange
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (devToolsDetected) {
      setError('Security violation detected. Access denied.');
      return;
    }

    const value = e.target.value;
    if (/^\d{0,3}$/.test(value)) {
      setPassword(value);
      setError('');
      
      // Auto-unlock when 3 digits are entered
      if (value.length === 3 && !isBlocked && !isLoading) {
        setIsLoading(true);
        
        try {
          // Add security headers and anti-tampering measures
          const response = await fetch('/api/password-auth', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
              'X-Security-Token': btoa(Date.now().toString()),
            },
            body: JSON.stringify({ 
              password: value,
              timestamp: Date.now(),
              userAgent: navigator.userAgent,
              referrer: document.referrer || 'direct'
            }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            // Clear attempts and redirect
            sessionStorage.removeItem('pw_failed_attempts');
            sessionStorage.removeItem('pw_block_end');
            router.push(redirectPath);
          } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            sessionStorage.setItem('pw_failed_attempts', newAttempts.toString());
            
            if (newAttempts >= MAX_ATTEMPTS) {
              const blockEndTime = Date.now() + (BLOCK_DURATION * 1000);
              sessionStorage.setItem('pw_block_end', blockEndTime.toString());
              setIsBlocked(true);
              setTimeRemaining(BLOCK_DURATION);
              setError(`Too many failed attempts. Access blocked for ${BLOCK_DURATION} seconds.`);
              
              intervalRef.current = setInterval(() => {
                const remaining = Math.ceil((blockEndTime - Date.now()) / 1000);
                if (remaining <= 0) {
                  setIsBlocked(false);
                  setTimeRemaining(0);
                  setAttempts(0);
                  sessionStorage.removeItem('pw_block_end');
                  sessionStorage.removeItem('pw_failed_attempts');
                  if (intervalRef.current) clearInterval(intervalRef.current);
                } else {
                  setTimeRemaining(remaining);
                }
              }, 1000);
            } else {
              setError(`Incorrect password. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
            }
          }
        } catch (error) {
          setError('An error occurred. Please try again.');
          setDevToolsDetected(true); // Treat network errors as potential tampering
        } finally {
          setIsLoading(false);
          setPassword('');
        }
      }
    }
  };

  // Enhanced security measures
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const blockedKeys = [
        'F12', 'F11', 'F10', 'F9', 'F8', 'F7', 'F6', 'F5', 'F4', 'F3', 'F2', 'F1',
        'Escape'
      ];
      
      if (blockedKeys.includes(e.key) ||
          (e.ctrlKey && e.shiftKey && ['I', 'C', 'J', 'K'].includes(e.key.toUpperCase())) ||
          (e.ctrlKey && ['U', 'S', 'A', 'P', 'H'].includes(e.key.toUpperCase())) ||
          (e.altKey && ['F4'].includes(e.key)) ||
          e.key === 'PrintScreen') {
        e.preventDefault();
        e.stopPropagation();
        setDevToolsDetected(true);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setDevToolsDetected(true);
    };

    const handleSelectStart = (e: Event) => {
      e.preventDefault();
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('selectstart', handleSelectStart, true);
    document.addEventListener('dragstart', handleDragStart, true);
    
    // Disable copy/paste
    document.addEventListener('copy', (e) => e.preventDefault(), true);
    document.addEventListener('paste', (e) => e.preventDefault(), true);
    document.addEventListener('cut', (e) => e.preventDefault(), true);

    // Add CSS to prevent text selection
    document.body.style.userSelect = 'none';
    (document.body.style as any).webkitUserSelect = 'none';
    (document.body.style as any).mozUserSelect = 'none';
    (document.body.style as any).msUserSelect = 'none';

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('selectstart', handleSelectStart, true);
      document.removeEventListener('dragstart', handleDragStart, true);
      document.removeEventListener('copy', (e) => e.preventDefault(), true);
      document.removeEventListener('paste', (e) => e.preventDefault(), true);
      document.removeEventListener('cut', (e) => e.preventDefault(), true);
      
      document.body.style.userSelect = '';
      (document.body.style as any).webkitUserSelect = '';
      (document.body.style as any).mozUserSelect = '';
      (document.body.style as any).msUserSelect = '';
    };
  }, []);

  // Clear sensitive data on unmount
  useEffect(() => {
    return () => {
      setPassword('');
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (devToolsDetected) {
    return (
      <div className="min-h-screen bg-red-900 flex items-center justify-center p-4">
        <div className="bg-red-100 border border-red-400 rounded-lg p-8 max-w-md text-center" style={{ userSelect: 'none' }}>
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">Security Violation Detected</h2>
          <p className="text-red-700">
            Developer tools or unauthorized access attempt detected. 
            Please refresh the page and try again without using developer tools.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md" style={{ userSelect: 'none' }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Secure Access Portal</h2>
          <p className="text-gray-600">Enter the 3-digit access code to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Access Code
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={handleInputChange}
              disabled={isBlocked || isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="•••"
              maxLength={3}
              autoComplete="off"
              autoFocus={!isBlocked && !isLoading}
              ref={(input) => {
                if (input && !isBlocked && !isLoading) {
                  setTimeout(() => input.focus(), 100);
                }
              }}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {isBlocked && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-800 text-sm text-center">
                Access blocked. Time remaining: {timeRemaining}s
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isBlocked || password.length !== 3 || isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : isBlocked ? `Blocked (${timeRemaining}s)` : 'Auto-unlock enabled'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Attempts: {attempts}/{MAX_ATTEMPTS}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Unauthorized access attempts are logged and monitored
          </p>
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Initializing Security...</h2>
          <p className="text-gray-600">Please wait</p>
        </div>
      </div>
    </div>
  );
}

// Main component wrapped with Suspense
export default function PasswordAuthPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PasswordAuthContent />
    </Suspense>
  );
}