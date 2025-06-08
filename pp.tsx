import React, { useState, useEffect } from 'react';

interface PasswordProtectionProps {
  children: React.ReactNode;
  onUnlock?: () => void;
}

const PasswordProtection: React.FC<PasswordProtectionProps> = ({ 
  children, 
  onUnlock 
}) => {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [error, setError] = useState('');

  const CORRECT_PASSWORD = '000';
  const MAX_ATTEMPTS = 5;
  const BLOCK_DURATION = 30; // seconds

  // Check if user is currently blocked
  useEffect(() => {
    const blockEndTime = localStorage.getItem('blockEndTime');
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
            localStorage.removeItem('blockEndTime');
            localStorage.removeItem('failedAttempts');
            clearInterval(interval);
          } else {
            setTimeRemaining(remaining);
          }
        }, 1000);

        return () => clearInterval(interval);
      } else {
        // Block period has expired
        localStorage.removeItem('blockEndTime');
        localStorage.removeItem('failedAttempts');
      }
    }

    // Load failed attempts count
    const savedAttempts = localStorage.getItem('failedAttempts');
    if (savedAttempts) {
      setAttempts(parseInt(savedAttempts));
    }
  }, []);

  const checkPassword = (pwd: string) => {
  if (isBlocked) {
    setError(`Please wait ${timeRemaining} seconds before trying again.`);
    return;
  }

  if (pwd === CORRECT_PASSWORD) {
    setIsUnlocked(true);
    setError('');
    setAttempts(0);
    localStorage.removeItem('failedAttempts');
    localStorage.removeItem('blockEndTime');
    onUnlock?.();
  } else {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    localStorage.setItem('failedAttempts', newAttempts.toString());
    
    if (newAttempts >= MAX_ATTEMPTS) {
      const blockEndTime = Date.now() + (BLOCK_DURATION * 1000);
      localStorage.setItem('blockEndTime', blockEndTime.toString());
      setIsBlocked(true);
      setTimeRemaining(BLOCK_DURATION);
      setError(`Too many failed attempts. Access blocked for ${BLOCK_DURATION} seconds.`);
      
      const interval = setInterval(() => {
        const remaining = Math.ceil((blockEndTime - Date.now()) / 1000);
        if (remaining <= 0) {
          setIsBlocked(false);
          setTimeRemaining(0);
          setAttempts(0);
          localStorage.removeItem('blockEndTime');
          localStorage.removeItem('failedAttempts');
          clearInterval(interval);
        } else {
          setTimeRemaining(remaining);
        }
      }, 1000);
    } else {
      setError(`Incorrect password. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
    }
  }
};

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  // Only allow digits and limit to 3 characters
  if (/^\d{0,3}$/.test(value)) {
    setPassword(value);
    setError('');
    
    // Auto-check password when 3 digits are entered
    if (value.length === 3) {
      setTimeout(() => checkPassword(value), 100); // Small delay for better UX
    }
  }
};

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent common bypass attempts
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'u')) {
      e.preventDefault();
    }
  };

  // Prevent right-click context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown as any);
    document.addEventListener('contextmenu', handleContextMenu as any);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown as any);
      document.removeEventListener('contextmenu', handleContextMenu as any);
    };
  }, []);

  if (isUnlocked) {
    return <>{children}</>;
  }

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

        <form  className="space-y-6">
          <div className="space-y-6">
  <div>
    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
      Password
    </label>
    <input
      id="password"
      type="password"
      value={password}
      onChange={handleInputChange}
      disabled={isBlocked}
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
</div>

          <button
            type="submit"
            disabled={isBlocked || password.length !== 3}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            {isBlocked ? `Blocked (${timeRemaining}s)` : 'Unlock'}
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
};

export default PasswordProtection;