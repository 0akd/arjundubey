"use client"
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Plus, Minus, Edit2, Trash2, Save, X, RotateCcw } from 'lucide-react';
import supabase from '@/config/supabase';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/firebase";

interface Counter {
  id: string;
  title: string;
  description: string;
  unit: string;
  value: number;
  record: number;
  created_at: string;
  updated_at: string;
}

interface NewCounter {
  title: string;
  description: string;
  unit: string;
  value: number;
  record: number;
}

const CounterManager: React.FC = () => {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [expandedCounters, setExpandedCounters] = useState<Set<string>>(new Set());
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCounter, setEditingCounter] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  
  const [newCounter, setNewCounter] = useState<NewCounter>({
    title: '',
    description: '',
    unit: '',
    value: 0,
    record: 0
  });

  const [editValues, setEditValues] = useState<Partial<Counter>>({});
  const [recordEditValue, setRecordEditValue] = useState<number>(0);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        setUserEmail(user.email);
        setIsAdmin(user.email === 'reboostify@gmail.com');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchCounters();
  }, []);

  const fetchCounters = async () => {
    try {
      const { data, error } = await supabase
        .from('counters')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCounters(data || []);
    } catch (error) {
      console.error('Error fetching counters:', error);
    }
  };

  const toggleExpanded = (counterId: string) => {
    const newExpanded = new Set(expandedCounters);
    if (newExpanded.has(counterId)) {
      newExpanded.delete(counterId);
    } else {
      newExpanded.add(counterId);
    }
    setExpandedCounters(newExpanded);
  };

  const updateCounterValue = async (counterId: string, newValue: number) => {
    try {
      const counter = counters.find(c => c.id === counterId);
      if (!counter) return;

      const updateData: any = { value: newValue };
      
      // Update record if new value is higher
      if (newValue > counter.record) {
        updateData.record = newValue;
      }

      const { error } = await supabase
        .from('counters')
        .update(updateData)
        .eq('id', counterId);

      if (error) throw error;
      fetchCounters();
    } catch (error) {
      console.error('Error updating counter:', error);
    }
  };

  const addCounter = async () => {
    try {
      const { error } = await supabase
        .from('counters')
        .insert([newCounter]);

      if (error) throw error;
      
      setNewCounter({ title: '', description: '', unit: '', value: 0, record: 0 });
      setShowAddForm(false);
      fetchCounters();
    } catch (error) {
      console.error('Error adding counter:', error);
    }
  };

  const deleteCounter = async (counterId: string) => {
    const counter = counters.find(c => c.id === counterId);
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${counter?.title}"? This action cannot be undone.`
    );
    
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('counters')
        .delete()
        .eq('id', counterId);

      if (error) throw error;
      fetchCounters();
    } catch (error) {
      console.error('Error deleting counter:', error);
      alert('Failed to delete counter. Please try again.');
    }
  };

  const startEditing = (counter: Counter) => {
    setEditingCounter(counter.id);
    setEditValues({
      title: counter.title,
      description: counter.description,
      unit: counter.unit,
      value: counter.value
    });
  };

  const saveEdit = async () => {
    if (!editingCounter) return;
    
    try {
      const { error } = await supabase
        .from('counters')
        .update(editValues)
        .eq('id', editingCounter);

      if (error) throw error;
      
      setEditingCounter(null);
      setEditValues({});
      fetchCounters();
    } catch (error) {
      console.error('Error updating counter:', error);
    }
  };

  const updateRecord = async (counterId: string, newRecord: number) => {
    try {
      const { error } = await supabase
        .from('counters')
        .update({ record: newRecord })
        .eq('id', counterId);

      if (error) throw error;
      
      setEditingRecord(null);
      fetchCounters();
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  const resetAllCounters = async () => {
  const confirmReset = window.confirm(
    'Are you sure you want to reset ALL counter values to 0? This will not affect the record values. This action cannot be undone.'
  );
  
  if (!confirmReset) return;

  try {
    // Get all counter IDs first
    const counterIds = counters.map(counter => counter.id);
    
    if (counterIds.length === 0) {
      alert('No counters to reset.');
      return;
    }

    // Update all counters by their IDs
    const { error } = await supabase
      .from('counters')
      .update({ value: 0 })
      .in('id', counterIds);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    fetchCounters();
    alert('All counter values have been reset to 0.');
  } catch (error) {
    console.error('Error resetting counters:', error);
    alert(`Failed to reset counters: ${error.message || 'Unknown error'}. Please try again.`);
  }
};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Counter Dashboard</h1>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 rounded-lg hover:opacity-80 transition-all duration-200 flex items-center justify-center gap-2 border border-current"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add Counter</span>
            <span className="sm:hidden">Add</span>
          </button>
        )}
      </div>

      {/* Add Counter Form */}
      {showAddForm && isAdmin && (
        <div className="p-4 sm:p-6 rounded-lg mb-8 border border-current">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Add New Counter</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Title"
              value={newCounter.title}
              onChange={(e) => setNewCounter({...newCounter, title: e.target.value})}
              className="border border-current rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-current"
            />
            <input
              type="text"
              placeholder="Unit (e.g., users, downloads)"
              value={newCounter.unit}
              onChange={(e) => setNewCounter({...newCounter, unit: e.target.value})}
              className="border border-current rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-current"
            />
            <textarea
              placeholder="Description"
              value={newCounter.description}
              onChange={(e) => setNewCounter({...newCounter, description: e.target.value})}
              className="border border-current rounded-lg px-3 py-2 col-span-full focus:outline-none focus:ring-2 focus:ring-current"
              rows={3}
            />
            <input
              type="number"
              placeholder="Initial Value"
              value={newCounter.value}
              onChange={(e) => setNewCounter({...newCounter, value: parseInt(e.target.value) || 0})}
              className="border border-current rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-current"
            />
            <input
              type="number"
              placeholder="Initial Record"
              value={newCounter.record}
              onChange={(e) => setNewCounter({...newCounter, record: parseInt(e.target.value) || 0})}
              className="border border-current rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-current"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button
              onClick={addCounter}
              disabled={!newCounter.title.trim()}
              className="px-4 py-2 rounded-lg hover:opacity-80 transition-all duration-200 border border-current disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Counter
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-lg hover:opacity-80 transition-all duration-200 border border-current"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Counters List */}
      <div className="space-y-4">
        {counters.map((counter) => (
          <div key={counter.id} className="border border-current rounded-lg shadow-sm">
            {/* Counter Header */}
            <div className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleExpanded(counter.id)}
                    className="flex-shrink-0 hover:opacity-70 transition-opacity"
                  >
                    {expandedCounters.has(counter.id) ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                  </button>
                  
                  {editingCounter === counter.id ? (
                    <input
                      type="text"
                      value={editValues.title || ''}
                      onChange={(e) => setEditValues({...editValues, title: e.target.value})}
                      className="text-lg font-semibold border-b border-current focus:outline-none focus:border-opacity-70 bg-transparent flex-1 min-w-0"
                    />
                  ) : (
                    <h3 className="text-lg font-semibold truncate">{counter.title}</h3>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Counter Value Display */}
                  <div className="text-center sm:text-right">
                    {editingCounter === counter.id ? (
                      <input
                        type="number"
                        value={editValues.value || 0}
                        onChange={(e) => setEditValues({...editValues, value: parseInt(e.target.value) || 0})}
                        className="text-xl sm:text-2xl font-bold border-b border-current focus:outline-none focus:border-opacity-70 bg-transparent w-20 text-center sm:text-right"
                      />
                    ) : (
                      <span className="text-xl sm:text-2xl font-bold">{counter.value.toLocaleString()}</span>
                    )}
                    {editingCounter === counter.id ? (
                      <input
                        type="text"
                        value={editValues.unit || ''}
                        onChange={(e) => setEditValues({...editValues, unit: e.target.value})}
                        className="text-sm border-b border-current focus:outline-none focus:border-opacity-70 bg-transparent w-16 text-center"
                      />
                    ) : (
                      <div className="text-sm opacity-70">{counter.unit}</div>
                    )}
                  </div>

                  {/* Admin Controls */}
                  {isAdmin && (
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      {editingCounter === counter.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={saveEdit}
                            className="p-2 hover:opacity-70 rounded-lg transition-opacity"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingCounter(null);
                              setEditValues({});
                            }}
                            className="p-2 hover:opacity-70 rounded-lg transition-opacity"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => updateCounterValue(counter.id, counter.value - 1)}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg hover:opacity-80 transition-all duration-200 flex items-center justify-center font-bold text-lg sm:text-xl border border-current"
                          >
                            <Minus size={20} />
                          </button>
                          <button
                            onClick={() => updateCounterValue(counter.id, counter.value + 1)}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg hover:opacity-80 transition-all duration-200 flex items-center justify-center font-bold text-lg sm:text-xl border border-current"
                          >
                            <Plus size={20} />
                          </button>
                          <button
                            onClick={() => startEditing(counter)}
                            className="p-2 hover:opacity-70 rounded-lg transition-opacity"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteCounter(counter.id)}
                            className="p-2 hover:opacity-70 rounded-lg transition-opacity"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Record Row */}
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-sm">
                  Record: 
                  {editingRecord === counter.id && isAdmin ? (
                    <div className="inline-flex items-center gap-2 ml-2 flex-wrap">
                      <input
                        type="number"
                        value={recordEditValue}
                        onChange={(e) => setRecordEditValue(parseInt(e.target.value) || 0)}
                        className="border border-current rounded px-2 py-1 w-20 text-sm focus:outline-none focus:ring-1 focus:ring-current"
                      />
                      <button
                        onClick={() => updateRecord(counter.id, recordEditValue)}
                        className="hover:opacity-70 transition-opacity"
                      >
                        <Save size={14} />
                      </button>
                      <button
                        onClick={() => setEditingRecord(null)}
                        className="hover:opacity-70 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <span className="font-semibold ml-2">
                      {counter.record.toLocaleString()} {counter.unit}
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setEditingRecord(counter.id);
                            setRecordEditValue(counter.record);
                          }}
                          className="ml-2 hover:opacity-70 transition-opacity"
                        >
                          <Edit2 size={12} />
                        </button>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Extended Description */}
            {expandedCounters.has(counter.id) && (
              <div className="px-4 pb-4 border-t border-current">
                {editingCounter === counter.id ? (
                  <textarea
                    value={editValues.description || ''}
                    onChange={(e) => setEditValues({...editValues, description: e.target.value})}
                    className="w-full mt-3 p-2 border border-current rounded-lg focus:outline-none focus:ring-2 focus:ring-current"
                    rows={3}
                    placeholder="Counter description..."
                  />
                ) : (
                  <p className="mt-3 leading-relaxed">
                    {counter.description || 'No description provided.'}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {counters.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg opacity-70">No counters found. {isAdmin ? 'Add your first counter!' : ''}</p>
        </div>
      )}

      {/* Reset All Counters Button - Admin Only */}
      {isAdmin && counters.length > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={resetAllCounters}
            className="px-6 py-3 rounded-lg hover:opacity-80 transition-all duration-200 border border-current flex items-center gap-2 font-medium"
          >
            <RotateCcw size={18} />
            <span className="hidden sm:inline">Reset All Counter Values</span>
            <span className="sm:hidden">Reset All Values</span>
          </button>
        </div>
      )}

      {/* User Info */}
      <div className="mt-8 text-center text-sm opacity-70">
        Logged in as: {userEmail} {isAdmin && '(Admin)'}
      </div>
    </div>
  );
};

export default CounterManager;