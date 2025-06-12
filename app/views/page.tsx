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
      <div >
 
      </div>
    );
  }

  if (error) {
    return (
      <div >
   
      </div>
    );
  }

  return (
        <button className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
      <Eye className="w-4 h-4" />
      <span className="font-medium">{counter?.count || 0}</span>
    </button>
  );
};

export default DeviceCounter;