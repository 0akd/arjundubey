'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PasswordAuthPage() {
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const MAX_ATTEMPTS = 5;
  const BLOCK_DURATION = 30; // seconds

  // Check if user is currently blocked
  useEffect(() => {
    const blockEndTime = localStorage.getItem('pw_block_end');
    const failedAttempts = localStorage.getItem('pw_failed_attempts');
    
    if (blockEndTime) {
      const now = Date.now();
      const endTime = parseInt(blockEndTime);
      
      if (now < endTime) {
        setIsBlocked(true);
        setTimeRemaining(Math.ceil((endTime - now) / 1000));
        
        const interval = setInterval(() => {
          const remaining = Math.ceil((endTime - Date.now()) / 1000);
          if (remaining <= 0) {
            setIsBlocked(false);
            setTimeRemaining(0);
            setAttempts(0);
            localStorage.removeItem('pw_block_end');
            localStorage.removeItem('pw_failed_attempts');
            clearInterval(interval);
          } else {
            setTimeRemaining(remaining);
          }
        }, 1000);

        return () => clearInterval(interval);
      } else {
        localStorage.removeItem('pw_block_end');
        localStorage.removeItem('pw_failed_attempts');
      }
    }

    if (failedAttempts) {
      setAttempts(parseInt(failedAttempts));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBlocked) {
      setError(`Please wait ${timeRemaining} seconds before trying again.`);
      return;
    }

    if (!/^\d{3}$/.test(password)) {
      setError('Password must be exactly 3 digits.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/password-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Clear attempts and redirect
        localStorage.removeItem('pw_failed_attempts');
        localStorage.removeItem('pw_block_end');
        router.push(redirectPath);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        localStorage.setItem('pw_failed_attempts', newAttempts.toString());
        
        if (newAttempts >= MAX_ATTEMPTS) {
          const blockEndTime = Date.now() + (BLOCK_DURATION * 1000);
          localStorage.setItem('pw_block_end', blockEndTime.toString());
          setIsBlocked(true);
          setTimeRemaining(BLOCK_DURATION);
          setError(`Too many failed attempts. Access blocked for ${BLOCK_DURATION} seconds.`);
          
          const interval = setInterval(() => {
            const remaining = Math.ceil((blockEndTime - Date.now()) / 1000);
            if (remaining <= 0) {
              setIsBlocked(false);
              setTimeRemaining(0);
              setAttempts(0);
              localStorage.removeItem('pw_block_end');
              localStorage.removeItem('pw_failed_attempts');
              clearInterval(interval);
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
    } finally {
      setIsLoading(false);
      setPassword('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d{0,3}$/.test(value)) {
      setPassword(value);
      setError('');
    }
  };

  // Prevent common bypass attempts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'C') ||
          (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Protected</h2>
          <p className="text-gray-600">Enter the 3-digit password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
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
              autoFocus
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
            {isLoading ? 'Verifying...' : isBlocked ? `Blocked (${timeRemaining}s)` : 'Unlock'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Attempts: {attempts}/{MAX_ATTEMPTS}
          </p>
        </div>
      </div>
    </div>
  );
}