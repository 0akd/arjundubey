'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/config/supabase';
import Model from '../../3d/sin/spirit/page';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { app } from "@/firebase";

interface Counter {
  id: number;
  title: string;
  description: string;
  current_value: number;
  goal_value: number;
  unit: string;
  created_at: string;
}

interface NewCounter {
  title: string;
  description: string;
  goal_value: number;
  unit: string;
}

const CounterPage: React.FC = () => {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [loading, setLoading] = useState(true);
  const [clickCount, setClickCount] = useState(0);
  const [expandedCounters, setExpandedCounters] = useState<Set<number>>(new Set());
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  // Admin form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<number>>(new Set());
  const [newCounter, setNewCounter] = useState<NewCounter>({
    title: '',
    description: '',
    goal_value: 0,
    unit: ''
  });
  const [editingCounter, setEditingCounter] = useState<Counter | null>(null);
  const [editForm, setEditForm] = useState<NewCounter>({
    title: '',
    description: '',
    goal_value: 0,
    unit: ''
  });

  // Check authentication and admin status
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        setIsAdmin(user.email === 'reboostify@gmail.com');
      } else {
        setUserEmail(null);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch counters from Supabase
  useEffect(() => {
    fetchCounters();
  }, []);

  const fetchCounters = async () => {
    try {
      const { data, error } = await supabase
        .from('spirit')
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



  const toggleCounterExpansion = (counterId: number) => {
    const newExpanded = new Set(expandedCounters);
    if (newExpanded.has(counterId)) {
      newExpanded.delete(counterId);
    } else {
      newExpanded.add(counterId);
    }
    setExpandedCounters(newExpanded);
  };

  const toggleDescription = (counterId: number) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(counterId)) {
        newSet.delete(counterId);
      } else {
        newSet.add(counterId);
      }
      return newSet;
    });
  };

  // Admin functions
  const addCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCounter.title.trim() || newCounter.goal_value <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('spirit')
        .insert([
          {
            title: newCounter.title,
            description: newCounter.description,
            current_value: 0,
            goal_value: newCounter.goal_value,
            unit: newCounter.unit
          }
        ])
        .select();

      if (error) {
        console.error('Error adding counter:', error);
        alert('Error adding counter');
      } else {
        setCounters([...data, ...counters]);
        setNewCounter({ title: '', description: '', goal_value: 0, unit: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding counter');
    }
  };

  const updateCounter = async (id: number, newValue: number) => {
    try {
      const { error } = await supabase
        .from('spirit')
        .update({ current_value: newValue })
        .eq('id', id);

      if (error) {
        console.error('Error updating counter:', error);
      } else {
        setCounters(counters.map(counter =>
          counter.id === id ? { ...counter, current_value: newValue } : counter
        ));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const incrementCounter = (id: number) => {
    const counter = counters.find(c => c.id === id);
    if (counter) {
      updateCounter(id, counter.current_value + 1);
    }
  };

  const decrementCounter = (id: number) => {
    const counter = counters.find(c => c.id === id);
    if (counter && counter.current_value > 0) {
      updateCounter(id, counter.current_value - 1);
    }
  };

  const deleteCounter = async (id: number) => {
    if (!confirm('Are you sure you want to delete this counter?')) return;

    try {
      const { error } = await supabase
        .from('spirit')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting counter:', error);
      } else {
        setCounters(counters.filter(counter => counter.id !== id));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetAllCounters = async () => {
    if (!confirm('Are you sure you want to reset all counters to 0? This action cannot be undone.')) return;

    try {
      const counterIds = counters.map(counter => counter.id);
      
      const { error } = await supabase
        .from('spirit')
        .update({ current_value: 0 })
        .in('id', counterIds);

      if (error) {
        console.error('Error resetting counters:', error);
        alert('Error resetting counters');
      } else {
        setCounters(counters.map(counter => ({ ...counter, current_value: 0 })));
        alert('All counters have been reset to 0');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error resetting counters');
    }
  };

  const startEditCounter = (counter: Counter) => {
    setEditingCounter(counter);
    setEditForm({
      title: counter.title,
      description: counter.description,
      goal_value: counter.goal_value,
      unit: counter.unit
    });
  };

  const cancelEdit = () => {
    setEditingCounter(null);
    setEditForm({ title: '', description: '', goal_value: 0, unit: '' });
  };

  const updateCounterDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editForm.title.trim() || editForm.goal_value <= 0 || !editingCounter) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('spirit')
        .update({
          title: editForm.title,
          description: editForm.description,
          goal_value: editForm.goal_value,
          unit: editForm.unit
        })
        .eq('id', editingCounter.id);

      if (error) {
        console.error('Error updating counter:', error);
        alert('Error updating counter');
      } else {
        setCounters(counters.map(counter =>
          counter.id === editingCounter.id
            ? { ...counter, ...editForm }
            : counter
        ));
        cancelEdit();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating counter');
    }
  };



 const getCounterColor = (current: number, goal: number) => {
  if (current >= goal) {
    return ' border-purple-400 ';
  }
  
  const progress = current / goal;
  
  if (progress >= 0.8) {
    return ' border-green-400 ';
  }
  if (progress >= 0.6) {
    return ' border-yellow-400 ';
  }
  if (progress >= 0.4) {
    return ' border-blue-400 ';
  }
  if (progress >= 0.2) {
    return ' border-orange-400 ';
  }
  
  return ' border-red-400 ';
};

const getProgressColor = (current: number, goal: number) => {
  if (current >= goal) return 'bg-purple-500';
  
  const progress = current / goal;
  
  if (progress >= 0.8) return 'bg-green-500';
  if (progress >= 0.6) return 'bg-yellow-500';
  if (progress >= 0.4) return 'bg-blue-500';
  if (progress >= 0.2) return 'bg-orange-500';
  
  return 'bg-red-500';
};
  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-lg sm:text-xl">Loading counters...</div>
      </div>
    );
  }

  return (
    <div className="lg:py-8">
      {/* Secret clickable header */}
      <div className="text-center mb-6 sm:mb-8 px-4">
        <div 
         
          className="inline-block cursor-pointer select-none"
        >
          <h1 className="text-2xl pt-4 sm:text-3xl lg:text-4xl font-bold">Spirit Stats</h1>
          <p>spirit is referring the being formed by mind body connectivity so gives an organism different dimensional characteristics </p>
        </div>
        {isAdmin && (
          <div className="mt-4 text-sm text-blue-600">
            Admin Mode - {userEmail}
          </div>
        )}
      </div>
      
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-between px-4 lg:px-32 py-8 gap-8">
                  <div className="relative w-full lg:w-[30%]">
               {/* Left overlay: blocks touch on small screens only */}
               <div className="absolute top-0 left-0 h-full w-[25%] z-50 block lg:hidden" />
         
               {/* Right overlay: blocks touch on small screens only */}
               <div className="absolute top-0 right-0 h-full w-[25%] z-50 block lg:hidden" />
         
               {/* Main Model content */}
               <Model />
             </div>
      
            {/* Admin Controls */}
            {isAdmin && (
              <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 mb-6">
                <div className=" border border-blue-200 rounded-lg p-4">
                  <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Admin Controls</h2>
             
                  </div>
                  
                  <div className="flex flex-wrap space-x-3">
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="   px-4 py-2 rounded-lg font-medium transition-colors mb-2"
                    >
                      Add New Counter
                    </button>
                    {counters.length > 0 && (
                      <button
                        onClick={resetAllCounters}
                        className=" px-4 py-2 rounded-lg font-medium transition-colors mb-2"
                      >
                        Reset All Counters
                      </button>
                    )}
                  </div>
      
                  {/* Add Counter Form */}
                  {showAddForm && (
                    <div className=" rounded-lg shadow-md p-4 mt-4">
                      <h3 className="text-lg font-semibold mb-3">Add New Counter</h3>
                      <form onSubmit={addCounter} className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium  mb-1">
                            Title *
                          </label>
                          <input
                            type="text"
                            value={newCounter.title}
                            onChange={(e) => setNewCounter({ ...newCounter, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter counter title"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium  mb-1">
                            Description
                          </label>
                          <textarea
                            value={newCounter.description}
                            onChange={(e) => setNewCounter({ ...newCounter, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter description (optional)"
                            rows={2}
                          />
                        </div>
      
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium  mb-1">
                              Goal Value *
                            </label>
                            <input
                              type="number"
                              value={newCounter.goal_value || ''}
                              onChange={(e) => setNewCounter({ ...newCounter, goal_value: parseInt(e.target.value) || 0 })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="100"
                              min="1"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium  mb-1">
                              Unit
                            </label>
                            <input
                              type="text"
                              value={newCounter.unit}
                              onChange={(e) => setNewCounter({ ...newCounter, unit: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g., steps, pages, minutes"
                            />
                          </div>
                        </div>
      
                        <div className="flex space-x-3">
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-md font-medium transition-colors"
                          >
                            Add Counter
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className=" px-4 py-2 rounded-md font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            )}
           
            {/* Counters Display */}
            <div className="w-full lg:w-[70%] max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
              {counters.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-base sm:text-lg">No counters found</p>
                  {isAdmin && (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className=" px-6 py-2 rounded-lg font-medium transition-colors mt-4"
                    >
                      Create Your First Counter
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {counters.map((counter) => (
                    <div
                      key={counter.id}
                      className={`rounded-lg border-2 transition-all duration-200 ${
                        isAdmin ? '' : 'cursor-pointer'
                      } ${getCounterColor(counter.current_value, counter.goal_value)}`}
                      onClick={!isAdmin ? () => toggleCounterExpansion(counter.id) : undefined}
                    >
                      {isAdmin && editingCounter?.id === counter.id ? (
                        // Admin Edit Form
                        <div className="p-3 sm:p-4">
                          <form onSubmit={updateCounterDetails} className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-1">Title *</label>
                              <input
                                type="text"
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                required
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-1">Description</label>
                              <textarea
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                rows={2}
                              />
                            </div>
      
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-sm font-medium mb-1">Goal *</label>
                                <input
                                  type="number"
                                  value={editForm.goal_value || ''}
                                  onChange={(e) => setEditForm({ ...editForm, goal_value: parseInt(e.target.value) || 0 })}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  min="1"
                                  required
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium mb-1">Unit</label>
                                <input
                                  type="text"
                                  value={editForm.unit}
                                  onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            </div>
      
                            <div className="flex space-x-2">
                              <button
                                type="submit"
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-all"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      ) : (
                        // Counter Display
                        <>
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
                                  <span className="text-xs sm:text-sm">
                                    /{counter.goal_value} {counter.unit}
                                  </span>
                                </div>
                              </div>
      
                              {/* Progress Bar */}
                              <div className="flex-1 sm:flex-2 max-w-full sm:max-w-xs lg:max-w-sm">
                                <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
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
                                  <span className="text-xs sm:text-sm px-2 py-1 rounded-full font-medium">
                                    🎉
                                  </span>
                                )}
                                
                                {/* Admin Controls */}
                                {isAdmin && (
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => decrementCounter(counter.id)}
                                      disabled={counter.current_value <= 0}
                                      className="disabled:opacity-30 disabled:cursor-not-allowed bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm font-medium transition-all"
                                    >
                                      -
                                    </button>
                                    <button
                                      onClick={() => incrementCounter(counter.id)}
                                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm font-medium transition-all"
                                    >
                                      +
                                    </button>
                                    <button
                                      onClick={() => startEditCounter(counter)}
                                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                      title="Edit counter"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => deleteCounter(counter.id)}
                                      className="text-red-500 hover:text-red-700 text-sm"
                                      title="Delete counter"
                                    >
                                      ×
                                    </button>
                                  </div>
                                )}
                                
                                {/* Expand indicator for regular users */}
                                {!isAdmin && counter.description && (
                                  <span className="text-xs transform transition-transform duration-200 ml-1">
                                    {expandedCounters.has(counter.id) ? '▲' : '▼'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
      
                          {/* Expandable description */}
                          {counter.description && expandedCounters.has(counter.id) && !isAdmin && (
                            <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
                              <div className="border-t border-opacity-50 pt-2 sm:pt-3">
                                <p className="text-xs sm:text-sm leading-relaxed">
                                  {counter.description}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {/* Admin description display */}
                          {isAdmin && counter.description && (
                            <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
                              <div 
                                className="border-t border-opacity-50 pt-2 sm:pt-3 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => toggleDescription(counter.id)}
                                title="Click to expand/collapse description"
                              >
                                <p className={`text-xs sm:text-sm leading-relaxed ${expandedDescriptions.has(counter.id) ? "" : "truncate"}`}>
                                  {counter.description}
                                </p>
                                {counter.description.length > 50 && (
                                  <span className="text-xs text-blue-600 hover:text-blue-800">
                                    {expandedDescriptions.has(counter.id) ? "Click to collapse" : "Click to expand"}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div></div>
    </div>
  );
};

export default CounterPage;