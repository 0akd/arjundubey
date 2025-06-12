'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react';
import supabase from '@/config/supabase';
import { Eye, RefreshCw, AlertCircle, Shield, Zap } from 'lucide-react';

interface ViewCounterData {
  id: string;
  count: number;
  last_updated: string;
}

interface DeviceView {
  id: string;
  view_counter_id: string;
  device_fingerprint: string;
  session_id: string;
  first_viewed: string;
  last_viewed: string;
  view_duration: number;
  interaction_score: number;
  viewport_time: number;
  scroll_depth: number;
  mouse_activity: boolean;
  keyboard_activity: boolean;
  page_focus_time: number;
  is_verified_human: boolean;
}

interface ViewSession {
  sessionId: string;
  startTime: number;
  totalDuration: number;
  interactionScore: number;
  scrollDepth: number;
  mouseMovements: number;
  keystrokes: number;
  focusTime: number;
  isInViewport: boolean;
  viewportStartTime: number;
  totalViewportTime: number;
}

const UltraRobustViewCounter: React.FC = () => {
  const [counter, setCounter] = useState<ViewCounterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>('');
  const [session, setSession] = useState<ViewSession | null>(null);
  const [isHumanVerified, setIsHumanVerified] = useState(false);
  const [hasProcessedView, setHasProcessedView] = useState(false); // Prevent duplicate processing
  
  // Refs for tracking
  const elementRef = useRef<HTMLDivElement>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const mouseActivityRef = useRef<boolean>(false);
  const keyboardActivityRef = useRef<boolean>(false);
  const isProcessingRef = useRef<boolean>(false); // Prevent race conditions

  // Generate STABLE device fingerprint (removed random and time components)
  const generateAdvancedFingerprint = useCallback(async (): Promise<string> => {
    const getWebGLInfo = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return 'no-webgl';
        
        const webglContext = gl as WebGLRenderingContext;
        const renderer = webglContext.getParameter(webglContext.RENDERER);
        const vendor = webglContext.getParameter(webglContext.VENDOR);
        const version = webglContext.getParameter(webglContext.VERSION);
        const shadingLanguageVersion = webglContext.getParameter(webglContext.SHADING_LANGUAGE_VERSION);
        
        return `${renderer}-${vendor}-${version}-${shadingLanguageVersion}`;
      } catch {
        return 'webgl-error';
      }
    };

    const getCanvasFingerprint = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return 'no-canvas';
        
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('Ultra View Counter 🔥', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillRect(0, 0, 150, 50);
        
        return canvas.toDataURL();
      } catch {
        return 'canvas-error';
      }
    };

    const fingerprint = {
      // Basic info (stable)
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages?.join(',') || 'unknown',
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      
      // Screen info (stable)
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      availScreen: `${screen.availWidth}x${screen.availHeight}`,
      devicePixelRatio: window.devicePixelRatio,
      
      // Hardware info (stable)
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as any).deviceMemory || 'unknown',
      maxTouchPoints: navigator.maxTouchPoints,
      
      // Timezone (stable for most users)
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      
      // Graphics (stable)
      webgl: getWebGLInfo(),
      canvas: getCanvasFingerprint().slice(-100),
      
      // Browser features (stable)
      webRTC: 'RTCPeerConnection' in window,
      localStorage: 'localStorage' in window,
      sessionStorage: 'sessionStorage' in window,
      indexedDB: 'indexedDB' in window,
      
      // REMOVED: random component and timestamp for stability
    };

    const fingerprintString = JSON.stringify(fingerprint);
    
    // Use Web Crypto API for hashing if available
    if ('crypto' in window && 'subtle' in crypto) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(fingerprintString);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return 'fp_' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 60);
      } catch {
        return 'fp_' + btoa(fingerprintString).replace(/[^a-zA-Z0-9]/g, '').slice(0, 60);
      }
    }
    
    return 'fp_' + btoa(fingerprintString).replace(/[^a-zA-Z0-9]/g, '').slice(0, 60);
  }, []);

  // Generate STABLE session ID (only once per component mount)
  const generateSessionId = useCallback(() => {
    // Use more stable session ID
    const sessionKey = `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    return sessionKey;
  }, []); // Empty dependency array ensures this is created only once

  // STRICTER human verification
  const verifyHumanBehavior = useCallback((session: ViewSession): boolean => {
    const {
      totalDuration,
      interactionScore,
      mouseMovements,
      keystrokes,
      scrollDepth,
      totalViewportTime
    } = session;

    // More stringent heuristics for human verification
    const checks = {
      minimumDuration: totalDuration > 5000, // At least 5 seconds (increased)
      significantInteraction: interactionScore > 15, // Increased threshold
      mouseActivity: mouseMovements > 25, // Increased threshold
      meaningfulViewportTime: totalViewportTime > 3000, // At least 3 seconds in viewport
      naturalScrolling: scrollDepth > 0.2 || scrollDepth === 0, // Either meaningful scroll or single page
      notTooFast: totalDuration > 2000, // Not suspiciously fast
      notTooSlow: totalDuration < 600000, // Not suspiciously slow (10 min max)
      hasKeyboardOrMouse: keystrokes > 0 || mouseMovements > 25, // Some form of interaction
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    return passedChecks >= 6; // Must pass at least 6 out of 8 checks (stricter)
  }, []);

  // Initialize session tracking (memoized to prevent recreation)
  const initializeSession = useCallback(() => {
    if (session) return session; // Don't recreate if already exists
    
    const sessionId = generateSessionId();
    const newSession: ViewSession = {
      sessionId,
      startTime: Date.now(),
      totalDuration: 0,
      interactionScore: 0,
      scrollDepth: 0,
      mouseMovements: 0,
      keystrokes: 0,
      focusTime: 0,
      isInViewport: false,
      viewportStartTime: 0,
      totalViewportTime: 0
    };
    
    setSession(newSession);
    return newSession;
  }, [session, generateSessionId]);

  // Track mouse activity (with debouncing)
  useEffect(() => {
    let mouseTimer: NodeJS.Timeout;
    let moveCount = 0;
    
    const handleMouseMove = () => {
      moveCount++;
      
      if (!mouseActivityRef.current) {
        mouseActivityRef.current = true;
        setSession(prev => prev ? { 
          ...prev, 
          mouseMovements: prev.mouseMovements + 1, 
          interactionScore: prev.interactionScore + 0.5 // Reduced score per move
        } : null);
      }
      
      clearTimeout(mouseTimer);
      mouseTimer = setTimeout(() => {
        mouseActivityRef.current = false;
      }, 2000); // Increased timeout
      
      lastActivityRef.current = Date.now();
    };

    const handleClick = () => {
      setSession(prev => prev ? { ...prev, interactionScore: prev.interactionScore + 5 } : null);
      lastActivityRef.current = Date.now();
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      clearTimeout(mouseTimer);
    };
  }, []);

  // Check if device has valid view (extended timeframe)
  const checkValidDeviceView = async (counterId: string, fingerprint: string, sessionId: string): Promise<boolean> => {
    try {
      // Check recent views from this device (within last 24 hours instead of 1 hour)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('device_views')
        .select('*')
        .eq('view_counter_id', counterId)
        .eq('device_fingerprint', fingerprint)
        .eq('is_verified_human', true)
        .gte('last_viewed', twentyFourHoursAgo);

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return (data && data.length > 0) || false;
    } catch (err) {
      console.error('Error checking device view:', err);
      return false;
    }
  };

  // Process view after sufficient interaction (with race condition protection)
  useEffect(() => {
    if (!session || !deviceFingerprint || hasProcessedView || isProcessingRef.current) return;

    const processView = async () => {
      if (isProcessingRef.current) return; // Additional race condition check
      
      const isVerifiedHuman = verifyHumanBehavior(session);
      
      if (isVerifiedHuman && !isHumanVerified) {
        isProcessingRef.current = true; // Set processing flag
        setIsHumanVerified(true);
        
        try {
          const counterId = await initializeCounter();
          const hasRecentView = await checkValidDeviceView(counterId, deviceFingerprint, session.sessionId);
          
          if (!hasRecentView) {
            await incrementVerifiedCounter(counterId);
            await recordVerifiedView(counterId, deviceFingerprint, session);
            await loadCounter();
            setHasProcessedView(true); // Mark as processed
          }
        } catch (err) {
          console.error('Error processing verified view:', err);
        } finally {
          isProcessingRef.current = false; // Reset processing flag
        }
      }
    };

    // Only check after significant interaction time
    if (session.totalDuration > 8000 && session.interactionScore > 10) {
      const timer = setTimeout(processView, 2000);
      return () => clearTimeout(timer);
    }
  }, [session, deviceFingerprint, isHumanVerified, hasProcessedView, verifyHumanBehavior]);

  // Initialize counter in database
  const initializeCounter = async (): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('view_counters')
        .select('*')
        .eq('id', 'ultra_view_counter')
        .single();

      if (error && error.code === 'PGRST116') {
        const { data: newCounter, error: insertError } = await supabase
          .from('view_counters')
          .insert([{ id: 'ultra_view_counter', count: 0 }])
          .select()
          .single();

        if (insertError) throw insertError;
        return newCounter.id;
      } else if (error) {
        throw error;
      }

      return data.id;
    } catch (err) {
      console.error('Error initializing counter:', err);
      throw new Error('Failed to initialize counter');
    }
  };

  // Record verified view
  const recordVerifiedView = async (counterId: string, fingerprint: string, sessionData: ViewSession) => {
    try {
      const now = new Date().toISOString();
      
      const deviceView = {
        view_counter_id: counterId,
        device_fingerprint: fingerprint,
        session_id: sessionData.sessionId,
        first_viewed: now,
        last_viewed: now,
        view_duration: sessionData.totalDuration,
        interaction_score: sessionData.interactionScore,
        viewport_time: sessionData.totalViewportTime,
        scroll_depth: sessionData.scrollDepth,
        mouse_activity: sessionData.mouseMovements > 0,
        keyboard_activity: sessionData.keystrokes > 0,
        page_focus_time: sessionData.focusTime,
        is_verified_human: true
      };

      const { error } = await supabase
        .from('device_views')
        .insert([deviceView]);

      if (error) throw error;
    } catch (err) {
      console.error('Error recording verified view:', err);
      throw err;
    }
  };

  // Increment counter with verification
  const incrementVerifiedCounter = async (counterId: string): Promise<number> => {
    try {
      const { data, error } = await supabase.rpc('increment_verified_counter', {
        view_counter_id: counterId
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error incrementing counter:', err);
      // Fallback: manually increment
      const { data, error } = await supabase
        .from('view_counters')
        .select('count')
        .eq('id', counterId)
        .single();
      
      if (error) throw error;
      
      const newCount = (data.count || 0) + 1;
      const { error: updateError } = await supabase
        .from('view_counters')
        .update({ count: newCount, last_updated: new Date().toISOString() })
        .eq('id', counterId);
      
      if (updateError) throw updateError;
      return newCount;
    }
  };

  // Load counter data
  const loadCounter = async () => {
    try {
      const { data, error } = await supabase
        .from('view_counters')
        .select('*')
        .eq('id', 'ultra_view_counter')
        .single();

      if (error && error.code === 'PGRST116') {
        await initializeCounter();
        await loadCounter();
        return;
      }

      if (error) throw error;
      setCounter(data);
    } catch (err) {
      console.error('Error loading counter:', err);
      setError('Failed to load counter data');
    }
  };

  // Track keyboard activity
  useEffect(() => {
    const handleKeydown = () => {
      if (!keyboardActivityRef.current) {
        keyboardActivityRef.current = true;
        setSession(prev => prev ? { ...prev, keystrokes: prev.keystrokes + 1, interactionScore: prev.interactionScore + 3 } : null);
      }
      lastActivityRef.current = Date.now();
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, []);

  // Track scroll activity
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = documentHeight > 0 ? scrollTop / documentHeight : 0;
      
      setSession(prev => prev ? { 
        ...prev, 
        scrollDepth: Math.max(prev.scrollDepth, scrollDepth),
        interactionScore: prev.interactionScore + 1
      } : null);
      
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track page focus
  useEffect(() => {
    let focusStartTime = Date.now();
    
    const handleFocus = () => {
      focusStartTime = Date.now();
    };
    
    const handleBlur = () => {
      const focusDuration = Date.now() - focusStartTime;
      setSession(prev => prev ? { ...prev, focusTime: prev.focusTime + focusDuration } : null);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      handleBlur();
    };
  }, []);

  // Intersection Observer for viewport tracking
  useEffect(() => {
    if (!elementRef.current) return;

    intersectionObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isInViewport = entry.isIntersecting;
          const now = Date.now();
          
          setSession(prev => {
            if (!prev) return null;
            
            let updatedSession = { ...prev };
            
            if (isInViewport && !prev.isInViewport) {
              updatedSession.isInViewport = true;
              updatedSession.viewportStartTime = now;
            } else if (!isInViewport && prev.isInViewport) {
              const viewportDuration = now - prev.viewportStartTime;
              updatedSession.isInViewport = false;
              updatedSession.totalViewportTime += viewportDuration;
            }
            
            return updatedSession;
          });
        });
      },
      {
        threshold: [0.1, 0.5, 0.9],
        rootMargin: '0px'
      }
    );

    intersectionObserverRef.current.observe(elementRef.current);

    return () => {
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }
    };
  }, []);

  // Session timer
  useEffect(() => {
    if (!session) return;

    sessionTimerRef.current = setInterval(() => {
      setSession(prev => {
        if (!prev) return null;
        
        const now = Date.now();
        const totalDuration = now - prev.startTime;
        
        let updatedSession = { ...prev, totalDuration };
        
        if (prev.isInViewport) {
          const additionalViewportTime = now - prev.viewportStartTime;
          updatedSession.totalViewportTime = prev.totalViewportTime + additionalViewportTime;
          updatedSession.viewportStartTime = now;
        }
        
        return updatedSession;
      });
    }, 500); // Reduced frequency

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [session]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('ultra_view_counter_changes')
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'view_counters', 
          filter: 'id=eq.ultra_view_counter' 
        },
        (payload: any) => {
          if (payload.new) {
            setCounter(payload.new as ViewCounterData);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Initialize component (only once)
  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      try {
        setLoading(true);
        setError(null);

        const fingerprint = await generateAdvancedFingerprint();
        if (!isMounted) return;
        
        setDeviceFingerprint(fingerprint);
        initializeSession();
        await loadCounter();

      } catch (err) {
        if (!isMounted) return;
        console.error('Initialization error:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initialize();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array ensures this runs only once

  // Manual refresh
  const handleRefresh = async () => {
    setLoading(true);
    try {
      await loadCounter();
      setError(null);
    } catch (err) {
      console.error('Refresh error:', err);
      setError('Failed to refresh counter');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
        <span className="text-sm text-blue-700">Initializing ultra-secure counter...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inline-flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
        <AlertCircle className="w-4 h-4 text-red-500" />
        <span className="text-sm text-red-700">Counter unavailable</span>
        <button
          onClick={handleRefresh}
          className="ml-2 text-xs px-2 py-1 bg-red-100 hover:bg-red-200 rounded text-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div ref={elementRef} className="inline-flex items-center gap-2">
      <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50 rounded-full border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-200">
        <Eye className="w-4 h-4 text-emerald-600" />
        <span className="text-sm font-medium text-gray-800">
          {counter?.count?.toLocaleString() || '0'}
        </span>
  
      </div>
    </div>
  );
};

export default UltraRobustViewCounter;