'use client';

import React, { useState, useEffect } from 'react';
import supabase from '@/config/supabase';
import PP from '@/pp'
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<number>>(new Set());
   const router = useRouter();
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
  // Fetch counters from Supabase
  useEffect(() => {
    fetchCounters();
  }, []);
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

  const addCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCounter.title.trim() || newCounter.goal_value <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('counters')
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
        .from('counters')
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
        .from('counters')
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
      // Get all counter IDs
      const counterIds = counters.map(counter => counter.id);
      
      // Update all counters to have current_value = 0
      const { error } = await supabase
        .from('counters')
        .update({ current_value: 0 })
        .in('id', counterIds);

      if (error) {
        console.error('Error resetting counters:', error);
        alert('Error resetting counters');
      } else {
        // Update local state
        setCounters(counters.map(counter => ({ ...counter, current_value: 0 })));
        alert('All counters have been reset to 0');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error resetting counters');
    }
  };

  const getCounterColor = (current: number, goal: number) => {
    if (current >= (goal*2)) {
      return ' border-green-500 text-green-800';
    }
    const progress = current / goal;
    if (progress >= goal) {
      return ' border-yellow-500 text-yellow-800';
    }
    return ' border-blue-500 text-blue-800';
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading counters...</div>
      </div>
    );
  }
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
      .from('counters')
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

 
async function handleLogout() {
    await signOut(getAuth(app));

    await fetch("/api/logout");

    router.push("/login");
  }
  return (
     <PP onUnlock={() => console.log('Access granted!')}>
    <div className="min-h-screen  py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Counter Dashboard</h1>
            <button
        onClick={handleLogout}
        className="text-white   focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center "      ></button>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddForm(true)}
              className=" px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Add New Counter
            </button>
            {counters.length > 0 && (
              <button
                onClick={resetAllCounters}
                className="bg-red-600 h  px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Reset All Counters
              </button>
            )}
          </div>
        </div>

        {showAddForm && (
          <div className=" rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Add New Counter</h2>
            <form onSubmit={addCounter} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newCounter.description}
                  onChange={(e) => setNewCounter({ ...newCounter, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter description (optional)"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="bg-green-600 hover:bg-green-700  px-4 py-2 rounded-md font-medium transition-colors"
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

       <div className="space-y-4">
  {counters.map((counter) => (
    <div
      key={counter.id}
   className={`rounded-lg border-2 p-6 transition-all duration-300 flex items-center justify-between ${getCounterColor(
  counter.current_value,
  counter.goal_value
)}`}
    >
    {editingCounter?.id === counter.id ? (
  // Edit Form (keep this section as is - it's already good for list mode)
  <form onSubmit={updateCounterDetails} className="w-full space-y-4">
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
        className="flex-1   px-3 py-1 rounded text-sm font-medium transition-all"
      >
        Save
      </button>
      <button
        type="button"
        onClick={cancelEdit}
        className="flex-1   px-3 py-1 rounded text-sm font-medium transition-all"
      >
        Cancel
      </button>
    </div>
  </form>
) : (
  // Horizontal Counter Display for List Mode
  <>
    {/* Left side - Counter info */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold truncate mr-4">{counter.title}</h3>
        <div className="flex space-x-1 flex-shrink-0">
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
      
      {counter.description && (
  <div 
    className="text-sm opacity-80 mb-2 cursor-pointer hover:opacity-100 transition-opacity"
    onClick={() => toggleDescription(counter.id)}
    title="Click to expand/collapse description"
  >
    <p className={expandedDescriptions.has(counter.id) ? "" : "truncate"}>
      {counter.description}
    </p>
    {counter.description.length > 50 && (
      <span className="text-xs text-blue-600 hover:text-blue-800">
        {expandedDescriptions.has(counter.id) ? "Click to collapse" : "Click to expand"}
      </span>
    )}
  </div>
)}

      <div className="flex items-center space-x-4">
        <span className="text-xl font-bold whitespace-nowrap">
          {counter.current_value} / {counter.goal_value} {counter.unit}
        </span>
        
        <div className="flex-1 min-w-0">
          <div className="w-full  rounded-full h-2">
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
      </div>
    </div>

    {/* Right side - Controls */}
    <div className="flex items-center space-x-2 ml-4">
      <button
        onClick={() => decrementCounter(counter.id)}
        disabled={counter.current_value <= 0}
        className="disabled:opacity-30 disabled:cursor-not-allowed px-4 py-2 rounded-md font-medium transition-all"
      >
        -
      </button>
      <button
        onClick={() => incrementCounter(counter.id)}
        className=" px-4 py-2 rounded-md font-medium transition-all"
      >
        +
      </button>
      
      {counter.current_value >= (counter.goal_value*2) && (
        <span className=" px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
          🎉 Goal Achieved!
        </span>
      )}
    </div>
  </>
      )}
    </div>
  ))}
</div>

        {counters.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No counters yet</div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Create Your First Counter
            </button>
          </div>
        )}
      </div>
    </div>
    </PP>
  );
};

export default CounterPage;