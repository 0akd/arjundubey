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

const RelaxedViewCounter: React.FC = () => {
  const [counter, setCounter] = useState<ViewCounterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>('');
  const [session, setSession] = useState<ViewSession | null>(null);
  const [isHumanVerified, setIsHumanVerified] = useState(false);
  const [hasProcessedView, setHasProcessedView] = useState(false);
  
  // Refs for tracking
  const elementRef = useRef<HTMLDivElement>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const mouseActivityRef = useRef<boolean>(false);
  const keyboardActivityRef = useRef<boolean>(false);
  const isProcessingRef = useRef<boolean>(false);

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
        ctx.fillText('Relaxed View Counter 🔥', 2, 15);
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
    const sessionKey = `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    return sessionKey;
  }, []);

  // MUCH MORE RELAXED human verification - counts almost any visit
  const verifyHumanBehavior = useCallback((session: ViewSession): boolean => {
    const {
      totalDuration,
      interactionScore,
      mouseMovements,
      keystrokes,
      scrollDepth,
      totalViewportTime
    } = session;

    // Very lenient heuristics - counts basic page visits
    const checks = {
      minimumDuration: totalDuration > 1000, // Just 1 second (very low)
      anyInteraction: interactionScore > 0 || mouseMovements > 0 || keystrokes > 0 || scrollDepth > 0, // Any interaction at all
      basicViewportTime: totalViewportTime > 500, // Just half a second in viewport
      notTooFast: totalDuration > 500, // Not suspiciously fast (half second)
      notTooSlow: totalDuration < 1800000, // 30 min max (very generous)
      hasAnyActivity: scrollDepth > 0 || mouseMovements > 0 || keystrokes > 0 || totalViewportTime > 1000, // Any sign of activity
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    
    // Very lenient - only need to pass 3 out of 6 checks
    // This will count most real visits including quick scrolls
    return passedChecks >= 3;
  }, []);

  // Initialize session tracking (memoized to prevent recreation)
  const initializeSession = useCallback(() => {
    if (session) return session;
    
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

  // Track mouse activity (very sensitive)
  useEffect(() => {
    let mouseTimer: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      if (!mouseActivityRef.current) {
        mouseActivityRef.current = true;
        setSession(prev => prev ? { 
          ...prev, 
          mouseMovements: prev.mouseMovements + 1, 
          interactionScore: prev.interactionScore + 1 // Higher score for any movement
        } : null);
      }
      
      clearTimeout(mouseTimer);
      mouseTimer = setTimeout(() => {
        mouseActivityRef.current = false;
      }, 1000); // Shorter timeout
      
      lastActivityRef.current = Date.now();
    };

    const handleClick = () => {
      setSession(prev => prev ? { ...prev, interactionScore: prev.interactionScore + 3 } : null);
      lastActivityRef.current = Date.now();
    };

    // Also track mouse enter/leave for better detection
    const handleMouseEnter = () => {
      setSession(prev => prev ? { ...prev, interactionScore: prev.interactionScore + 1 } : null);
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('click', handleClick, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mouseenter', handleMouseEnter);
      clearTimeout(mouseTimer);
    };
  }, []);

  // Check if device has valid view (shorter timeframe - 1 hour)
  const checkValidDeviceView = async (counterId: string, fingerprint: string, sessionId: string): Promise<boolean> => {
    try {
      // Check recent views from this device (within last 1 hour only)
      const oneHourAgo = new Date(Date.now() - 10*365*24*60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('device_views')
        .select('*')
        .eq('view_counter_id', counterId)
        .eq('device_fingerprint', fingerprint)
        .eq('is_verified_human', true)
        .gte('last_viewed', oneHourAgo);

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return (data && data.length > 0) || false;
    } catch (err) {
      console.error('Error checking device view:', err);
      return false;
    }
  };

  // Process view much faster and more frequently
  useEffect(() => {
    if (!session || !deviceFingerprint || hasProcessedView || isProcessingRef.current) return;

    const processView = async () => {
      if (isProcessingRef.current) return;
      
      const isVerifiedHuman = verifyHumanBehavior(session);
      
      if (isVerifiedHuman && !isHumanVerified) {
        isProcessingRef.current = true;
        setIsHumanVerified(true);
        
        try {
          const counterId = await initializeCounter();
          const hasRecentView = await checkValidDeviceView(counterId, deviceFingerprint, session.sessionId);
          
          if (!hasRecentView) {
            await incrementVerifiedCounter(counterId);
            await recordVerifiedView(counterId, deviceFingerprint, session);
            await loadCounter();
            setHasProcessedView(true);
          }
        } catch (err) {
          console.error('Error processing verified view:', err);
        } finally {
          isProcessingRef.current = false;
        }
      }
    };

    // Check much more frequently and with lower thresholds
    if (session.totalDuration > 1500) { // Just 1.5 seconds
      const timer = setTimeout(processView, 500); // Check every 500ms
      return () => clearTimeout(timer);
    }
  }, [session, deviceFingerprint, isHumanVerified, hasProcessedView, verifyHumanBehavior]);

  // Initialize counter in database
  const initializeCounter = async (): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('view_counters')
        .select('*')
        .eq('id', 'relaxed_view_counter')
        .single();

      if (error && error.code === 'PGRST116') {
        const { data: newCounter, error: insertError } = await supabase
          .from('view_counters')
          .insert([{ id: 'relaxed_view_counter', count: 0 }])
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
        .eq('id', 'relaxed_view_counter')
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
      keyboardActivityRef.current = true;
      setSession(prev => prev ? { 
        ...prev, 
        keystrokes: prev.keystrokes + 1, 
        interactionScore: prev.interactionScore + 2 
      } : null);
      lastActivityRef.current = Date.now();
    };

    document.addEventListener('keydown', handleKeydown, { passive: true });
    return () => document.removeEventListener('keydown', handleKeydown);
  }, []);

  // Track scroll activity (more sensitive)
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = documentHeight > 0 ? scrollTop / documentHeight : 0;
      
      setSession(prev => prev ? { 
        ...prev, 
        scrollDepth: Math.max(prev.scrollDepth, scrollDepth),
        interactionScore: prev.interactionScore + 2 // Higher score for scrolling
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

  // Intersection Observer for viewport tracking (more lenient)
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
              updatedSession.interactionScore = prev.interactionScore + 1; // Score for entering viewport
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
        threshold: [0.05, 0.25, 0.5], // Lower thresholds
        rootMargin: '50px' // Trigger earlier
      }
    );

    intersectionObserverRef.current.observe(elementRef.current);

    return () => {
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }
    };
  }, []);

  // Session timer (more frequent updates)
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
    }, 200); // More frequent updates

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [session]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('relaxed_view_counter_changes')
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'view_counters', 
          filter: 'id=eq.relaxed_view_counter' 
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
  }, []);

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
      <div className="inline-flex items-center gap-2 p-2 ">
        <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
        <span className="text-sm text-blue-700">initializing</span>
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
      <div className="flex items-center gap-1 px-3 py-1.5 ">
        <Eye className="w-4 h-4 text-emerald-600" />
        <span className="text-sm font-medium ">
          {counter?.count?.toLocaleString() || '0'}
        </span>
  
      </div>
    </div>
  );
};

export default RelaxedViewCounter;