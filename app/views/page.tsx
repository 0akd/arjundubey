'use client'
import React, { useState, useEffect, useCallback } from 'react';
import supabase from '@/config/supabase';
import { Eye, RefreshCw, AlertCircle } from 'lucide-react';

interface ViewCounterData {
  id: string;
  count: number;
  last_updated: string;
}

interface DeviceView {
  id: string;
  view_counter_id: string;
  device_fingerprint: string;
  first_viewed: string;
  last_viewed: string;
}

interface RealtimePayload {
  schema: string;
  table: string;
  commit_timestamp: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: ViewCounterData | null;
  old: ViewCounterData | null;
  errors: string[] | null;
}

const DeviceCounter: React.FC = () => {
  const [counter, setCounter] = useState<ViewCounterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>('');

  // Generate a robust device fingerprint
  const generateDeviceFingerprint = useCallback((): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('Device fingerprint', 10, 10);
    const canvasFingerprint = canvas.toDataURL();

    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvasFingerprint.slice(-50), // Last 50 chars for brevity
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as any).deviceMemory || 'unknown',
      webgl: (() => {
        try {
          const gl = canvas.getContext('webgl');
          return gl?.getParameter(gl.RENDERER) || 'unknown';
        } catch {
          return 'unknown';
        }
      })()
    };

    return btoa(JSON.stringify(fingerprint)).replace(/[^a-zA-Z0-9]/g, '').slice(0, 64);
  }, []);

  // Initialize counter in database if it doesn't exist
  const initializeCounter = async (): Promise<string> => {
    const { data, error } = await supabase
      .from('view_counters')
      .select('*')
      .eq('id', 'main_view_counter')
      .single();

    if (error && error.code === 'PGRST116') {
      // Counter doesn't exist, create it
      const { data: newCounter, error: insertError } = await supabase
        .from('view_counters')
        .insert([{ id: 'main_view_counter', count: 0 }])
        .select()
        .single();

      if (insertError) throw insertError;
      return newCounter.id;
    } else if (error) {
      throw error;
    }

    return data.id;
  };

  // Check if this device has viewed the counter before
  const checkDeviceView = async (counterId: string, fingerprint: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('device_views')
      .select('*')
      .eq('view_counter_id', counterId)
      .eq('device_fingerprint', fingerprint)
      .single();

    if (error && error.code === 'PGRST116') {
      return false; // Device hasn't viewed before
    } else if (error) {
      throw error;
    }

    return true; // Device has viewed before
  };

  // Record device view
  const recordDeviceView = async (counterId: string, fingerprint: string, isFirstTime: boolean) => {
    const now = new Date().toISOString();

    if (isFirstTime) {
      const { error } = await supabase
        .from('device_views')
        .insert([{
          view_counter_id: counterId,
          device_fingerprint: fingerprint,
          first_viewed: now,
          last_viewed: now
        }]);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('device_views')
        .update({ last_viewed: now })
        .eq('view_counter_id', counterId)
        .eq('device_fingerprint', fingerprint);

      if (error) throw error;
    }
  };

  // Increment counter atomically
  const incrementCounter = async (counterId: string): Promise<number> => {
    const { data, error } = await supabase.rpc('increment_view_counter', {
      view_counter_id: counterId
    });

    if (error) throw error;
    return data;
  };

  // Load counter data
  const loadCounter = async () => {
    try {
      const { data, error } = await supabase
        .from('view_counters')
        .select('*')
        .eq('id', 'main_view_counter')
        .single();

      if (error) throw error;
      setCounter(data);
    } catch (err) {
      console.error('Error loading counter:', err);
      setError('Failed to load counter data');
    }
  };
// Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('view_counter_changes')
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'view_counters', 
          filter: 'id=eq.main_view_counter' 
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
  // Initialize component
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        setError(null);

        // Generate device fingerprint
        const fingerprint = generateDeviceFingerprint();
        setDeviceFingerprint(fingerprint);

        // Initialize counter
        const counterId = await initializeCounter();

        // Check if this device has viewed before
        const hasViewedBefore = await checkDeviceView(counterId, fingerprint);

        // If first time viewing from this device, increment counter
        if (!hasViewedBefore) {
          await incrementCounter(counterId);
        }

        // Record this device view
        await recordDeviceView(counterId, fingerprint, !hasViewedBefore);

        // Load current counter data
        await loadCounter();

      } catch (err) {
        console.error('Initialization error:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [generateDeviceFingerprint]);



  // Manual refresh function
  const handleRefresh = async () => {
    setLoading(true);
    await loadCounter();
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg font-medium text-gray-700">Loading counter...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
          <h2 className="text-xl font-bold text-red-800">Error</h2>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-8 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 rounded-2xl shadow-xl border border-white/20">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full mb-6 shadow-lg">
          <Eye className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Device Counter</h1>
        <p className="text-gray-600 mb-6">Unique device views tracked</p>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-inner border border-white/40">
          <div className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            {counter?.count || 0}
          </div>
          <div className="text-sm text-gray-500">
            {counter?.last_updated && (
              <>Last updated: {new Date(counter.last_updated).toLocaleString()}</>
            )}
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="mt-6 inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>

        <div className="mt-6 p-4 bg-white/60 rounded-lg border border-white/40">
          <p className="text-xs text-gray-500 leading-relaxed">
            This counter increments only once per unique device. 
            Your device fingerprint: <br />
            <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
              {deviceFingerprint.slice(0, 20)}...
            </code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeviceCounter;