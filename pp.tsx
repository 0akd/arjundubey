import React, { useState, useEffect, useRef } from 'react';

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
  const [devToolsDetected, setDevToolsDetected] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Obfuscated password (still not secure, but harder to spot)
  const getCorrectPassword = () => {
    const encoded = 'MjEyMw=='; // Base64 encoded "2123"
    return atob(encoded);
  };

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

  // Enhanced security measures
  useEffect(() => {
    const blockEndTime = sessionStorage.getItem('blockEndTime');
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
            sessionStorage.removeItem('blockEndTime');
            sessionStorage.removeItem('failedAttempts');
            if (intervalRef.current) clearInterval(intervalRef.current);
          } else {
            setTimeRemaining(remaining);
          }
        }, 1000);
      } else {
        sessionStorage.removeItem('blockEndTime');
        sessionStorage.removeItem('failedAttempts');
      }
    }

    const savedAttempts = sessionStorage.getItem('failedAttempts');
    if (savedAttempts) {
      setAttempts(parseInt(savedAttempts));
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Enhanced password checking with anti-tampering
  const checkPassword = (pwd: string) => {
    if (devToolsDetected) {
      setError('Security violation detected. Access denied.');
      return;
    }

    if (isBlocked) {
      setError(`Please wait ${timeRemaining} seconds before trying again.`);
      return;
    }

    // Simple hash check to make it slightly harder to reverse engineer
    const hash = btoa(pwd + 'salt123');
    const correctHash = btoa(getCorrectPassword() + 'salt123');

    if (hash === correctHash) {
      setIsUnlocked(true);
      setError('');
      setAttempts(0);
      sessionStorage.removeItem('failedAttempts');
      sessionStorage.removeItem('blockEndTime');
      onUnlock?.();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      sessionStorage.setItem('failedAttempts', newAttempts.toString());
      
      if (newAttempts >= MAX_ATTEMPTS) {
        const blockEndTime = Date.now() + (BLOCK_DURATION * 1000);
        sessionStorage.setItem('blockEndTime', blockEndTime.toString());
        setIsBlocked(true);
        setTimeRemaining(BLOCK_DURATION);
        setError(`Too many failed attempts. Access blocked for ${BLOCK_DURATION} seconds.`);
        
        intervalRef.current = setInterval(() => {
          const remaining = Math.ceil((blockEndTime - Date.now()) / 1000);
          if (remaining <= 0) {
            setIsBlocked(false);
            setTimeRemaining(0);
            setAttempts(0);
            sessionStorage.removeItem('blockEndTime');
            sessionStorage.removeItem('failedAttempts');
            if (intervalRef.current) clearInterval(intervalRef.current);
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
    if (devToolsDetected) {
      setError('Security violation detected. Access denied.');
      return;
    }

    const value = e.target.value;
    if (/^\d{0,4}$/.test(value)) {
      setPassword(value);
      setError('');
      
      if (value.length === 4) {
        setTimeout(() => checkPassword(value), 100);
      }
    }
  };

  // Enhanced key blocking
  const handleKeyDown = (e: React.KeyboardEvent | KeyboardEvent) => {
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

  const handleContextMenu = (e: React.MouseEvent | MouseEvent) => {
    e.preventDefault();
    setDevToolsDetected(true);
  };

  const handleSelectStart = (e: React.MouseEvent | Event) => {
    e.preventDefault();
  };

  const handleDragStart = (e: React.DragEvent | DragEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    const keydownHandler = handleKeyDown as (e: KeyboardEvent) => void;
    const contextmenuHandler = handleContextMenu as (e: MouseEvent) => void;
    const selectstartHandler = handleSelectStart as (e: Event) => void;
    const dragstartHandler = handleDragStart as (e: DragEvent) => void;

    document.addEventListener('keydown', keydownHandler, true);
    document.addEventListener('contextmenu', contextmenuHandler, true);
    document.addEventListener('selectstart', selectstartHandler, true);
    document.addEventListener('dragstart', dragstartHandler, true);
    
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
      document.removeEventListener('keydown', keydownHandler, true);
      document.removeEventListener('contextmenu', contextmenuHandler, true);
      document.removeEventListener('selectstart', selectstartHandler, true);
      document.removeEventListener('dragstart', dragstartHandler, true);
      document.removeEventListener('copy', (e) => e.preventDefault(), true);
      document.removeEventListener('paste', (e) => e.preventDefault(), true);
      document.removeEventListener('cut', (e) => e.preventDefault(), true);
      
      document.body.style.userSelect = '';
      (document.body.style as any).webkitUserSelect = '';
      (document.body.style as any).mozUserSelect = '';
      (document.body.style as any).msUserSelect = '';
    };
  }, []);

  // Clear content from memory when component unmounts
  useEffect(() => {
    return () => {
      setPassword('');
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (devToolsDetected) {
    return (
      <div className="min-h-screen bg-red-900 flex items-center justify-center p-4">
        <div className="bg-red-100 border border-red-400 rounded-lg p-8 max-w-md text-center">
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

  if (isUnlocked) {
    return <div style={{ userSelect: 'none' }}>{children}</div>;
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
          <p className="text-gray-600">Enter the 4-digit access code to continue</p>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Access Code
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={handleInputChange}
              disabled={isBlocked}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="••••"
              maxLength={4}
              autoComplete="off"
              autoFocus={!isBlocked}
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

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Attempts: {attempts}/{MAX_ATTEMPTS}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Unauthorized access attempts are logged
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordProtection;