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
  position: number;
  created_at: string;
}

interface NewCounter {
  title: string;
  description: string;
}

const CounterPage: React.FC = () => {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [loading, setLoading] = useState(true);
  const [clickCount, setClickCount] = useState(0);
  const [expandedCounters, setExpandedCounters] = useState<Set<number>>(new Set());
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const router = useRouter();

  // Admin form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<number>>(new Set());
  const [newCounter, setNewCounter] = useState<NewCounter>({
    title: '',
    description: ''
  });
  const [editingCounter, setEditingCounter] = useState<Counter | null>(null);
  const [editForm, setEditForm] = useState<NewCounter>({
    title: '',
    description: ''
  });

  // Check authentication and admin status
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        const isUserAdmin = user.email === 'reboostify@gmail.com';
        setIsAdmin(isUserAdmin);
        if (isUserAdmin) {
          setAdminMode(false); // Default to admin mode for admins
        }
      } else {
        setUserEmail(null);
        setIsAdmin(false);
        setAdminMode(false);
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
        .order('position', { ascending: true });

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

  // Get counter color based on click count (1-5 clicks) - only for admins
// Get counter color based on click count (1-5 clicks) - now for all users
const getCounterColor = (clickCount: number) => {
  const clampedCount = Math.max(0, Math.min(5, clickCount));
  
  switch (clampedCount) {
    case 0:
      return 'border-gray-300 text-gray-900';
    case 1:
      return 'border-red-400 text-red-600';
    case 2:
      return 'border-orange-400 text-orange-600';
    case 3:
      return 'border-yellow-400 text-yellow-600';
    case 4:
      return 'border-green-400 text-green-600';
    case 5:
      return 'border-purple-400 text-purple-600';
    default:
      return 'border-gray-300 text-gray-900';
  }
};

  // Handle counter click (increment with max 5) - with left/right split for admins
  const handleCounterClick = (id: number, event?: React.MouseEvent) => {
    // Only allow counter changes for admins
    if (!isAdmin) return;
    
    const counter = counters.find(c => c.id === id);
    if (!counter) return;

    // For admins in non-admin mode, handle left/right click
    if (isAdmin && !adminMode && event) {
      const rect = event.currentTarget.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const elementWidth = rect.width;
      const isRightHalf = clickX > elementWidth / 2;

      if (isRightHalf) {
        // Right half - increment (max 5)
        if (counter.current_value < 5) {
          updateCounter(id, counter.current_value + 1);
        }
      } else {
        // Left half - decrement (min 0)
        if (counter.current_value > 0) {
          updateCounter(id, counter.current_value - 1);
        }
      }
    } else if (!adminMode) {
      // Normal user behavior - click to increment, reset at 5
      if (counter.current_value < 5) {
        updateCounter(id, counter.current_value + 1);
      } else {
        updateCounter(id, 0);
      }
    }
  };

  // Admin functions
  const addCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCounter.title.trim()) {
      alert('Please fill in the title');
      return;
    }

    try {
      // Get the next position
      const maxPosition = counters.length > 0 ? Math.max(...counters.map(c => c.position)) : 0;
      
      const { data, error } = await supabase
        .from('spirit')
        .insert([
          {
            title: newCounter.title,
            description: newCounter.description,
            current_value: 0,
            position: maxPosition + 1
          }
        ])
        .select();

      if (error) {
        console.error('Error adding counter:', error);
        alert('Error adding counter');
      } else {
        setCounters([...counters, ...data]);
        setNewCounter({ title: '', description: '' });
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
    if (counter && counter.current_value < 5) {
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

  const moveCounterUp = async (id: number) => {
    const sortedCounters = [...counters].sort((a, b) => a.position - b.position);
    const currentIndex = sortedCounters.findIndex(c => c.id === id);
    
    if (currentIndex > 0) {
      const currentCounter = sortedCounters[currentIndex];
      const upperCounter = sortedCounters[currentIndex - 1];
      
      try {
        const { error } = await supabase
          .from('spirit')
          .update({ position: upperCounter.position })
          .eq('id', currentCounter.id);

        const { error: error2 } = await supabase
          .from('spirit')
          .update({ position: currentCounter.position })
          .eq('id', upperCounter.id);

        if (error || error2) {
          console.error('Error moving counter:', error || error2);
        } else {
          fetchCounters(); // Refresh the list
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const moveCounterDown = async (id: number) => {
    const sortedCounters = [...counters].sort((a, b) => a.position - b.position);
    const currentIndex = sortedCounters.findIndex(c => c.id === id);
    
    if (currentIndex < sortedCounters.length - 1) {
      const currentCounter = sortedCounters[currentIndex];
      const lowerCounter = sortedCounters[currentIndex + 1];
      
      try {
        const { error } = await supabase
          .from('spirit')
          .update({ position: lowerCounter.position })
          .eq('id', currentCounter.id);

        const { error: error2 } = await supabase
          .from('spirit')
          .update({ position: currentCounter.position })
          .eq('id', lowerCounter.id);

        if (error || error2) {
          console.error('Error moving counter:', error || error2);
        } else {
          fetchCounters(); // Refresh the list
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const startEditCounter = (counter: Counter) => {
    setEditingCounter(counter);
    setEditForm({
      title: counter.title,
      description: counter.description
    });
  };

  const cancelEdit = () => {
    setEditingCounter(null);
    setEditForm({ title: '', description: '' });
  };

  const updateCounterDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editForm.title.trim() || !editingCounter) {
      alert('Please fill in the title');
      return;
    }

    try {
      const { error } = await supabase
        .from('spirit')
        .update({
          title: editForm.title,
          description: editForm.description
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
          onClick={handleSecretClick}
          className="inline-block cursor-pointer select-none"
        >
           <h1 className="text-2xl pt-4 sm:text-3xl lg:text-4xl font-bold">Spirit Stats</h1>
          <p>spirit is referring the being formed by mind body connectivity so gives an organism different dimensional characteristics </p>
        </div>
    
      </div>
      <div className="flex flex-col items-center lg:items-start justify-center lg:justify-between px-4 lg:px-32 py-8 gap-8">
         <div className="relative w-full ">
      {/* Left overlay: blocks touch on small screens only */}
      <div className="absolute top-0 left-0 h-full w-[25%] z-50 block " />

      {/* Right overlay: blocks touch on small screens only */}
      <div className="absolute top-0 right-0 h-full w-[25%] z-50 block " />

      {/* Main Model content */}
      <Model />
    </div>

      {/* Admin Controls */}
      {isAdmin && adminMode && (
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
      <div className="w-full  max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        {counters.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-base sm:text-lg">No counters found</p>
            {isAdmin && adminMode && (
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
                  adminMode ? '' : isAdmin ? 'cursor-pointer hover:shadow-md' : ''
                } ${getCounterColor(counter.current_value)} ${
                  isAdmin && !adminMode ? 'relative overflow-hidden' : ''
                }`}
                onClick={!adminMode && isAdmin ? (e) => handleCounterClick(counter.id, e) : undefined}
              >
                {/* Split overlay for admin in user mode */}
                {isAdmin && !adminMode && (
                  <>
                    <div className="absolute inset-0 w-1/2 left-0 z-10 opacity-0 hover:bg-red-100 hover:opacity-20 transition-all" 
                         title="Click to decrease" />
                    <div className="absolute inset-0 w-1/2 right-0 z-10 opacity-0 hover:bg-green-100 hover:opacity-20 transition-all" 
                         title="Click to increase" />
                  </>
                )}
                
                {isAdmin && adminMode && editingCounter?.id === counter.id ? (
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
                      {/* Compact user view - everything in one row */}
        

{/* Compact user view - everything in one row */}
{!isAdmin || !adminMode ? (
  <div className="flex items-center justify-between">
    <h3 className="text-sm sm:text-base font-semibold flex-1 min-w-0 truncate">
      {counter.title}
    </h3>
    <div className="flex items-center gap-2 ml-4">
      <span className="text-lg sm:text-xl font-bold">
        {counter.current_value}
      </span>
      {/* Dropdown button at the end of the row */}
      {counter.description && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleCounterExpansion(counter.id);
          }}
          className="ml-2 p-1 rounded hover:bg-gray-100 transition-colors"
          title="Show/hide description"
        >
          <svg 
            className={`w-4 h-4 transform transition-transform duration-200 ${
              expandedCounters.has(counter.id) ? 'rotate-180' : ''
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
    </div>
  </div>
) : (
                        // Admin view - original layout
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
                                /5
                              </span>
                            </div>
                          </div>

                          {/* Click indicators for admin */}
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((clickLevel) => (
                              <div
                                key={clickLevel}
                                className={`w-3 h-3 rounded-full border ${
                                  counter.current_value >= clickLevel
                                    ? getCounterColor(clickLevel).replace('border-', 'bg-').replace('-400', '-500').split(' ')[0]
                                    : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>

                          {/* Admin Controls */}
                          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => moveCounterUp(counter.id)}
                                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                                title="Move up"
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => moveCounterDown(counter.id)}
                                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                                title="Move down"
                              >
                                ↓
                              </button>
                              <button
                                onClick={() => decrementCounter(counter.id)}
                                disabled={counter.current_value <= 0}
                                className="disabled:opacity-30 disabled:cursor-not-allowed bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm font-medium transition-all"
                              >
                                -
                              </button>
                              <button
                                onClick={() => incrementCounter(counter.id)}
                                disabled={counter.current_value >= 5}
                                className="disabled:opacity-30 disabled:cursor-not-allowed bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm font-medium transition-all"
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
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expandable description for non-admin users */}
                    {counter.description && expandedCounters.has(counter.id) && (!isAdmin || !adminMode) && (
                      <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
                        <div className="border-t border-opacity-50 pt-2 sm:pt-3">
                          <p className="text-xs sm:text-sm leading-relaxed">
                            {counter.description}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Admin description display */}
                    {isAdmin && adminMode && counter.description && (
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
      </div></div>    {isAdmin && (
   
            
        
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={adminMode}
                  onChange={(e) => setAdminMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6  "></div>
              </label>
      

        )}
    </div>
  );
};

export default CounterPage;