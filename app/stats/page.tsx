'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/config/supabase';
import Model from '../3d/sin/page'
interface Counter {
  id: number;
  title: string;
  description: string;
  current_value: number;
  goal_value: number;
  unit: string;
  created_at: string;
}

const CounterPage: React.FC = () => {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [loading, setLoading] = useState(true);
  const [clickCount, setClickCount] = useState(0);
  const [expandedCounters, setExpandedCounters] = useState<Set<number>>(new Set());
  const router = useRouter();

  // Fetch counters from Supabase
  useEffect(() => {
    fetchCounters();
  }, []);

  const fetchCounters = async () => {
    try {
      const { data, error } = await supabase
        .from('counters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching counters:', error);
      } else {
        setCounters(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSecretClick = () => {
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    if (newClickCount === 5) {
      router.push('/counter');
      setClickCount(0);
    }

    setTimeout(() => {
      setClickCount(0);
    }, 3000);
  };

  const toggleCounterExpansion = (counterId: number) => {
    const newExpanded = new Set(expandedCounters);
    if (newExpanded.has(counterId)) {
      newExpanded.delete(counterId);
    } else {
      newExpanded.add(counterId);
    }
    setExpandedCounters(newExpanded);
  };

  const getCounterColor = (current: number, goal: number) => {
    if (current >= goal) {
      return 'bg-green-50 border-green-400 hover:bg-green-100';
    }
    const progress = current / goal;
    if (progress >= 0.8) {
      return 'bg-yellow-50 border-yellow-400 hover:bg-yellow-100';
    }
    return 'bg-blue-50 border-blue-400 hover:bg-blue-100';
  };

  const getProgressColor = (current: number, goal: number) => {
    if (current >= goal) return 'bg-green-500';
    const progress = current / goal;
    if (progress >= 0.8) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-lg sm:text-xl text-gray-600">Loading counters...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      {/* Secret clickable header */}
      <div className="text-center mb-6 sm:mb-8 px-4">
        <div 
          onClick={handleSecretClick}
          className="inline-block cursor-pointer select-none"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">Goal's Status</h1>
        </div>
      </div>
      <Model/>
     
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        {counters.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-base sm:text-lg">No counters found</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {counters.map((counter) => (
              <div
                key={counter.id}
                className={`rounded-lg border-2 transition-all duration-200 cursor-pointer ${getCounterColor(
                  counter.current_value,
                  counter.goal_value
                )}`}
                onClick={() => toggleCounterExpansion(counter.id)}
              >
                {/* Main counter line */}
                <div className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    {/* Title and Value */}
                    <div className="flex items-center justify-between sm:justify-start flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold truncate mr-2 sm:mr-4">
                        {counter.title}
                      </h3>
                      <div className="flex items-center gap-1">
                        <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                          {counter.current_value}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-600">
                          /{counter.goal_value} {counter.unit}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex-1 sm:flex-2 max-w-full sm:max-w-xs lg:max-w-sm">
                      <div className="w-full bg-white bg-opacity-70 rounded-full h-2 sm:h-3">
                        <div
                          className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${getProgressColor(
                            counter.current_value,
                            counter.goal_value
                          )}`}
                          style={{
                            width: `${getProgressPercentage(counter.current_value, counter.goal_value)}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Percentage and Status */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                      <span className="text-xs sm:text-sm font-medium">
                        {getProgressPercentage(counter.current_value, counter.goal_value).toFixed(1)}%
                      </span>
                      {counter.current_value >= counter.goal_value && (
                        <span className="text-xs sm:text-sm bg-white bg-opacity-70 px-2 py-1 rounded-full font-medium">
                          🎉
                        </span>
                      )}
                      {/* Expand indicator */}
                      {counter.description && (
                        <span className="text-xs text-gray-500 transform transition-transform duration-200 ml-1">
                          {expandedCounters.has(counter.id) ? '▲' : '▼'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable description */}
                {counter.description && expandedCounters.has(counter.id) && (
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
                    <div className="border-t border-white border-opacity-50 pt-2 sm:pt-3">
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                        {counter.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CounterPage;