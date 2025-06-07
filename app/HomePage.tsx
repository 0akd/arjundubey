'use client';

import React, { useState, useEffect } from 'react';
import supabase from '@/config/supabase';
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { app } from "../firebase";
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

  

  const getCounterColor = (current: number, goal: number) => {
    if (current >= goal) {
      return 'bg-green-100 border-green-500 text-green-800';
    }
    const progress = current / goal;
    if (progress >= 0.8) {
      return 'bg-yellow-100 border-yellow-500 text-yellow-800';
    }
    return 'bg-blue-100 border-blue-500 text-blue-800';
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading counters...</div>
      </div>
    );
  }
async function handleLogout() {
    await signOut(getAuth(app));

    await fetch("/api/logout");

    router.push("/login");
  }
  return (
    <div className="min-h-screen bg-gray-50 py-8">
       <button
        onClick={handleLogout}
        className="text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-primary-800"
      ></button>
      <div className="max-w-4xl mx-auto px-4">

        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {counters.map((counter) => (
              <div
              key={counter.id}
              className={`rounded-lg border-2 p-6 transition-all duration-300 ${getCounterColor(
                counter.current_value,
                counter.goal_value
              )}`}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold">{counter.title}</h3>
               
              </div>
              
              
              {counter.description && (
                <p className="text-sm opacity-80 mb-4">{counter.description}</p>
              )}

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xl font-bold">
                    {counter.current_value}
                  </span>
                  <span className="text-sm">
                    / {counter.goal_value} {counter.unit}
                  </span>
                </div>
                
                <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                  <div
                    className="bg-current h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${getProgressPercentage(counter.current_value, counter.goal_value)}%`
                    }}
                  ></div>
                </div>
                
                <div className="text-right text-xs mt-1">
                  {getProgressPercentage(counter.current_value, counter.goal_value).toFixed(1)}%
                </div>
              </div>

             

              {counter.current_value >= counter.goal_value && (
                <div className="mt-3 text-center">
                  <span className="inline-block bg-white bg-opacity-70 px-3 py-1 rounded-full text-sm font-medium">
                    🎉 Goal Achieved!
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

       
      </div>
    </div>
  );
};

export default CounterPage;