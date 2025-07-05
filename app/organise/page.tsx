"use client"
import React, { useState , useRef, useEffect } from 'react';
import { Plus, Check,ChevronDown, Trash2,IndianRupee, Edit2,RotateCcw, Target,BicepsFlexed,Flower, Brain,StretchVertical, BookOpen, BarChart3, Loader2, Lock } from 'lucide-react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/firebase";
import supabase from '@/config/supabase';
import CounterSnapshot from './todosnapshot'

interface Todo {
  id: number;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  created_at: string;
  user_email: string;
    is_counter?: boolean;        // ✅ new
  counter_value?: number; 
}

interface CategoryData {
  name: string;
  icon: React.ReactNode;
  total: number;
  completed: number;
  percentage: number;
}

// Hardcoded admin email
const ADMIN_EMAIL = 'reboostify@gmail.com';

const categories = [
  'Intelligence',
  'Flexibility',
  'Strength',
  'Spiritual',
  'Money'

];

const categoryIcons = {
  Intelligence: <Brain size={24} />,
  Flexibility: <StretchVertical size={24} />,
 
Money: <IndianRupee size={24} />,
  Strength: <BicepsFlexed size={24} />,
  Spiritual: <Flower size={24} />
};

// Loading Component
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-lg">Loading your todos...</p>
      </div>
    </div>
  );
}

// Access Control Component
function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8 border rounded-xl shadow-lg max-w-md">
        <Lock className="w-16 h-16 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="mb-4">
          Only the administrator (reboostify@gmail.com) can access this todo management system.
        </p>
        <p className="text-sm">
          Please contact the administrator if you need access.
        </p>
      </div>
    </div>
  );
}

// Authentication Required Component
function AuthRequired() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8 border rounded-xl shadow-lg max-w-md">
        <Lock className="w-16 h-16 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p className="mb-4">
          Please log in to access the todo management system.
        </p>
        <p className="text-sm">
          You need to be authenticated to view your todos.
        </p>
      </div>
    </div>
  );
}

// Todo App Component (Admin Only)
function TodoApp({ todos, onTodosChange, userEmail, isAdmin }: { 
  todos: Todo[], 
  onTodosChange: (todos: Todo[]) => void,
  userEmail: string,
  isAdmin: boolean
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Intelligence',
      is_counter: false,         // ✅ new
  counter_value: 0  
  });
  const [loading, setLoading] = useState(false);
const [activeCounterTodo, setActiveCounterTodo] = useState<Todo | null>(null);
const modalRef = useRef<HTMLDivElement>(null);
const [counterInputValue, setCounterInputValue] = useState<number | ''>('');
const inputRef = useRef<HTMLInputElement | null>(null);
const [addMode, setAddMode] = useState(false);
const [recentSnapshots, setRecentSnapshots] = useState<
  { id: number; snapshot_value: number; snap_at: string }[]
>([]);
const [originalSnapshots, setOriginalSnapshots] = useState<typeof recentSnapshots>([]);
 const [isCollapsed, setIsCollapsed] = useState(true);







useEffect(() => {
  const loadSnapshots = async () => {
    if (!activeCounterTodo) return;

    setCounterInputValue(addMode ? 0 : (activeCounterTodo.counter_value ?? 0));

    const { data, error } = await supabase
      .from('counter_snapshots')
      .select('id, snapshot_value, snap_at')
      .eq('todo_id', activeCounterTodo.id)
      .gte('snap_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('snap_at', { ascending: false });

    if (error) {
      console.error('Error loading snapshots:', error);
      setRecentSnapshots([]);
    } else {
      setRecentSnapshots(data);
      setOriginalSnapshots(data);
    }
  };

  loadSnapshots();
}, [activeCounterTodo, addMode]);
const snapshotsChanged = (): boolean => {
  return recentSnapshots.some(snap => {
    const original = originalSnapshots.find(o => o.id === snap.id);
    return original?.snapshot_value !== snap.snapshot_value;
  });
};

useEffect(() => {
  if (activeCounterTodo) {
    setCounterInputValue(addMode ? 0 : (activeCounterTodo.counter_value ?? 0));
  }
}, [activeCounterTodo, addMode]);

  // Initialize all categories as expanded on first load
  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    categories.forEach(category => {
      initialExpanded[category] = false;
    });
    setExpandedCategories(initialExpanded);
  }, []);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const addTodo = async () => {
    if (!isAdmin) {
      alert('Only the administrator can add or edit todos.');
      return;
    }

    if (!formData.title.trim()) return;
    
    setLoading(true);
    try {
      if (editingTodo) {
        // Update existing todo
        const { error } = await supabase
          .from('todos')
   .update({
  title: formData.title,
  description: formData.description,
  category: formData.category,
  is_counter: formData.is_counter,
  counter_value: formData.counter_value
})

          .eq('id', editingTodo.id)
          .eq('user_email', ADMIN_EMAIL);

        if (error) throw error;

        const updatedTodos = todos.map(todo => 
          todo.id === editingTodo.id 
            ? { ...todo, title: formData.title, description: formData.description, category: formData.category }
            : todo
        );
        onTodosChange(updatedTodos);
        setEditingTodo(null);
      } else {
        // Add new todo
       const { data, error } = await supabase
  .from('todos')
  .insert([{
    title: formData.title,
    description: formData.description,
    category: formData.category,
    completed: false,
    user_email: ADMIN_EMAIL,
    is_counter: formData.is_counter,
    counter_value: formData.counter_value
  }])
  .select()
  .single();


        if (error) throw error;

        onTodosChange([...todos, data]);
      }
setFormData({
  title: '',
  description: '',
  category: 'Intelligence',
  is_counter: false,
  counter_value: 0
});

      setShowForm(false);
    } catch (error) {
      console.error('Error saving todo:', error);
      alert('Error saving todo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const editTodo = (todo: Todo) => {
    if (!isAdmin) {
      alert('Only the administrator can edit todos.');
      return;
    }

    setEditingTodo(todo);
setFormData({
  title: todo.title,
  description: todo.description,
  category: todo.category,
  is_counter: todo.is_counter ?? false,
  counter_value: todo.counter_value ?? 0
});

    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingTodo(null);
 setFormData({
  title: '',
  description: '',
  category: 'Intelligence',
  is_counter: false,
  counter_value: 0
});

    setShowForm(false);
  };

  const toggleTodo = async (id: number) => {
    if (!isAdmin) {
      alert('Only the administrator can modify todos.');
      return;
    }

    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !todo.completed })
        .eq('id', id)
        .eq('user_email', ADMIN_EMAIL);

      if (error) throw error;

      const updatedTodos = todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
      onTodosChange(updatedTodos);
    } catch (error) {
      console.error('Error updating todo:', error);
      alert('Error updating todo. Please try again.');
    }
  };

 const resetAllTodos = async () => {
  if (!isAdmin) return;

  const counterTodos = todos.filter(todo => todo.is_counter);

  if (counterTodos.length === 0) {
    alert("No counter todos to snapshot.");
    return;
  }

  setLoading(true);

  try {
    const snapshots = counterTodos.map(todo => ({
      todo_id: todo.id,
      snapshot_value: todo.counter_value || 0,
    }));

    // Insert snapshots
    const { error: insertError } = await supabase
      .from('counter_snapshots')
      .insert(snapshots);

    if (insertError) throw insertError;

    // Prune old snapshots
    for (const todo of counterTodos) {
      await supabase.rpc('prune_old_snapshots', { target_todo_id: todo.id });
    }

    // ✅ Reset counters to 0
    const { error: counterResetError } = await supabase
      .from('todos')
      .update({ counter_value: 0 })
      .eq('user_email', ADMIN_EMAIL)
      .eq('is_counter', true);

    if (counterResetError) throw counterResetError;

    // ✅ Uncheck all completed todos
    const { error: uncheckError } = await supabase
      .from('todos')
      .update({ completed: false })
      .eq('user_email', ADMIN_EMAIL)
      .eq('completed', true);

    if (uncheckError) throw uncheckError;

    // ✅ Update UI state
    const updatedTodos = todos.map(todo => ({
      ...todo,
      completed: false,
      counter_value: todo.is_counter ? 0 : todo.counter_value,
    }));
    onTodosChange(updatedTodos);

    alert("All todos reset and counter snapshots taken.");
  } catch (error) {
    console.error('Error resetting todos:', error);
    alert("Error resetting todos.");
  } finally {
    setLoading(false);
  }
};


  const deleteTodo = async (id: number) => {
    if (!isAdmin) {
      alert('Only the administrator can delete todos.');
      return;
    }

    if (!confirm('Are you sure you want to delete this todo?')) return;

    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_email', ADMIN_EMAIL);

      if (error) throw error;

      const updatedTodos = todos.filter(todo => todo.id !== id);
      onTodosChange(updatedTodos);
    } catch (error) {
      console.error('Error deleting todo:', error);
      alert('Error deleting todo. Please try again.');
    }
  };

  const getTodosByCategory = (category: string) => {
    return todos.filter(todo => todo.category === category);
  };

  const getCompletionPercentage = (category: string) => {
    const categoryTodos = getTodosByCategory(category);
    if (categoryTodos.length === 0) return 0;
    const completed = categoryTodos.filter(todo => todo.completed).length;
    return (completed / categoryTodos.length) * 100;
  };
const updateCounter = async (id: number, delta: number) => {
  if (!isAdmin) return;

  const todo = todos.find(t => t.id === id);
  if (!todo || !todo.is_counter) return;

  const newValue = Math.max(0, (todo.counter_value ?? 0) + delta);

  try {
    console.log('Updating counter value to:', newValue);

    const { error: updateError } = await supabase
      .from('todos')
      .update({ counter_value: newValue })
      .eq('id', id)
      .eq('user_email', ADMIN_EMAIL);

    if (updateError) throw updateError;

    console.log('Fetching snapshot from past 7 days...');
const { data: snapshots, error: snapError } = await supabase
  .from('counter_snapshots')
  .select('snapshot_value, snap_at')
  .eq('todo_id', id)
  .gte('snap_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
  .order('snap_at', { ascending: false })
  .limit(1);

    if (snapError) throw snapError;

    const latestSnapshotValue = snapshots?.[0]?.snapshot_value ?? null;
    console.log('Latest snapshot value:', latestSnapshotValue);

    let completed = todo.completed;
    if (latestSnapshotValue !== null && newValue >= latestSnapshotValue && !todo.completed) {
      console.log('Marking as completed...');

      const { error: completeError } = await supabase
        .from('todos')
        .update({ completed: true })
        .eq('id', id)
        .eq('user_email', ADMIN_EMAIL);

      if (completeError) throw completeError;

      completed = true;
    }

    const updatedTodos = todos.map(t =>
      t.id === id ? { ...t, counter_value: newValue, completed } : t
    );
    onTodosChange(updatedTodos);

    if (activeCounterTodo && activeCounterTodo.id === id) {
      setActiveCounterTodo({ ...activeCounterTodo, counter_value: newValue });
    }
  } catch (err: any) {
    console.error('Detailed error in updateCounter:', err?.message || err);
    alert(`Error updating counter: ${err?.message || 'Unknown error'}`);
  }
};


const saveManualCounterValue = async () => {
  if (
    activeCounterTodo &&
    typeof counterInputValue === 'number' &&
    !isNaN(counterInputValue)
  ) {
    const delta = addMode
      ? counterInputValue
      : counterInputValue - (activeCounterTodo.counter_value ?? 0);

    await updateCounter(activeCounterTodo.id, delta);

    // ✅ Save all edited snapshots
    for (const snap of recentSnapshots) {
      const { error } = await supabase
        .from('counter_snapshots')
        .update({ snapshot_value: snap.snapshot_value })
        .eq('id', snap.id);

      if (error) {
        console.error(`Failed to update snapshot ID ${snap.id}:`, error);
      }
    }

    if (addMode) setCounterInputValue(0);
  }
};



useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setActiveCounterTodo(null);
    }
  };

  if (activeCounterTodo) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [activeCounterTodo]);
useEffect(() => {
  if (activeCounterTodo) {
    setCounterInputValue(activeCounterTodo.counter_value ?? 0);
  }
}, [activeCounterTodo]);
useEffect(() => {
  if (activeCounterTodo && inputRef.current) {
    // slight delay improves mobile keyboard pop-up reliability
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }
}, [activeCounterTodo]);









  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {isAdmin ? (
            <>
              <button
                onClick={resetAllTodos}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-red-300 text-red-700 rounded-lg  transition-colors text-sm sm:text-base"
                disabled={loading || todos.filter(todo => todo.completed).length === 0}
                title={todos.filter(todo => todo.completed).length === 0 ? 'No completed todos to reset' : 'Reset all completed todos'}
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Reset All</span>
                <span className="sm:hidden">Reset</span>
                ({todos.filter(todo => todo.completed).length})
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600  rounded-lg transition-colors text-sm sm:text-base"
                disabled={loading}
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Add Todo</span>
                <span className="sm:hidden">Add</span>
              </button>
            </>
          ) : (
            <div className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2   rounded-lg cursor-not-allowed text-sm sm:text-base">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
              Admin Only
            </div>
          )}
        </div>
      </div>

      {/* Read-only Notice */}
      {!isAdmin && (
        <div className="border rounded-lg p-3 sm:p-4">
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm">
                <strong>Read-only mode:</strong> Only reboostify@gmail.com can add, edit, or delete todos.
              </p>
              <p className="text-sm text-gray-600 mt-1">You can view all todos and progress.</p>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && isAdmin && (
        <div className="border rounded-lg p-4 sm:p-6 shadow-sm ">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">
            {editingTodo ? 'Edit Todo' : 'Add New Todo'}
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Todo title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              disabled={loading}
            />
            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 sm:p-3 border rounded-lg h-20 sm:h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              disabled={loading}
            />
            {formData.is_counter && (
  <input
    type="number"
    placeholder="Initial counter value"
    value={formData.counter_value}
    onChange={(e) => setFormData({ ...formData, counter_value: parseInt(e.target.value) || 0 })}
    className="w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
    disabled={loading}
  />
)}

            <select
  value={formData.is_counter ? 'counter' : 'checkbox'}
  onChange={(e) =>
    setFormData({ ...formData, is_counter: e.target.value === 'counter' })
  }
  className="w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
  disabled={loading}
>
  <option value="checkbox">Checkbox</option>
  <option value="counter">Counter</option>
</select>

            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              disabled={loading}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={addTodo}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 bg-blue-600  rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
                disabled={loading}
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {editingTodo ? 'Update Todo' : 'Add Todo'}
              </button>
              <button
                onClick={cancelEdit}
                className="px-4 sm:px-6 py-2 border border-gray-300 rounded-lg  transition-colors text-sm sm:text-base"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid gap-4 sm:gap-6">
        {categories.map(category => {
          const categoryTodos = getTodosByCategory(category);
          const completionPercentage = getCompletionPercentage(category);
          const isExpanded = expandedCategories[category];
          
          return (
            <div key={category} className="border rounded-lg shadow-sm  overflow-hidden">
              {/* Category Header - Always Visible */}
              <div 
                className="p-4 sm:p-6 cursor-pointer select-none  transition-colors"
                onClick={() => toggleCategory(category)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {categoryIcons[category as keyof typeof categoryIcons]}
                      <h3 className="text-lg sm:text-xl font-semibold truncate">
                        {category}
                      </h3>
                    </div>
                    <button
                      className={`p-1 rounded-full transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      aria-label={isExpanded ? 'Collapse category' : 'Expand category'}
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                      {categoryTodos.filter(t => t.completed).length}/{categoryTodos.length}
                    </span>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 relative flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeDasharray="100, 100"
                          className="opacity-30 text-gray-300"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeDasharray={`${completionPercentage}, 100`}
                          className="transition-all duration-500 ease-in-out text-blue-600"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {Math.round(completionPercentage)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expandable Todo List */}
              <div className={` transition-all duration-300 ease-in-out ${
                isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
              } overflow-hidden`}>
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t ">
                  <div className="space-y-2 sm:space-y-3 pt-4 overflow-auto max-h-64">
                    {categoryTodos.length === 0 ? (
                      <p className="italic text-gray-500 text-center py-4 text-sm sm:text-base">
                        No todos in this category
                      </p>
                    ) : (
                      categoryTodos.map(todo => (
                        
                <div
  key={todo.id}
  className={`flex items-start gap-2 sm:gap-3 p-3 sm:p-4 border rounded-lg transition-all ${
    todo.completed ? 'opacity-75' : 'hover:shadow-sm'
  } ${todo.is_counter && isAdmin ? 'cursor-pointer' : ''}`}
  onClick={() => {
    if (todo.is_counter && isAdmin) {
      setActiveCounterTodo(todo);
    }
  }}
>

                    <button
  onClick={(e) => {
    e.stopPropagation();
    toggleTodo(todo.id);
  }}
                            className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center mt-0.5 sm:mt-1 transition-all ${
                              todo.completed 
                                ? 'bg-green-500 border-green-500 ' 
                                : 'border-gray-300 '
                            } ${!isAdmin ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                            disabled={!isAdmin}
                            title={!isAdmin ? 'Admin access required' : 'Toggle completion'}
                          >
                            {todo.completed && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium text-sm sm:text-base ${
                              todo.completed ? 'line-through text-gray-500' : ''
                            }`}>
                              {todo.title}
                            </h4>        <CounterSnapshot todoId={todo.id} />
                          {todo.is_counter && (
  <div className="mt-2 text-sm">
    <button
      onClick={() => setActiveCounterTodo(todo)}
      className="font-mono text-blue-600 underline"
      disabled={!isAdmin}
    >
      Counter: {todo.counter_value ?? 0}
    </button>

  </div>
)}


                            {todo.description && (
                              <p className={`text-xs sm:text-sm mt-1 ${
                                todo.completed ? 'line-through text-gray-400' : 'text-gray-600'
                              }`}>
                                {todo.description}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Created {new Date(todo.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                   <button
  onClick={(e) => {
    e.stopPropagation();
    editTodo(todo);
  }}
                              className={`p-1 sm:p-1.5 rounded transition-colors ${
                                isAdmin 
                                  ? 'text-blue-600 hover:bg-blue-100 cursor-pointer' 
                                  : 'text-gray-400 cursor-not-allowed'
                              }`}
                              disabled={!isAdmin}
                              title={!isAdmin ? 'Admin access required' : 'Edit todo'}
                            >
                              <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                      <button
  onClick={(e) => {
    e.stopPropagation();
    deleteTodo(todo.id);
  }}
                              className={`p-1 sm:p-1.5 rounded transition-colors ${
                                isAdmin 
                                  ? 'text-red-600 hover:bg-red-100 cursor-pointer' 
                                  : 'text-gray-400 cursor-not-allowed'
                              }`}
                              disabled={!isAdmin}
                              title={!isAdmin ? 'Admin access required' : 'Delete todo'}
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                {activeCounterTodo && (
  <div className="fixed inset-0  flex items-center justify-center">
    <div       ref={modalRef} className=" rounded-xl bg-white/10 backdrop-blur-sm p-8 relative w-full max-w-md shadow-lg text-center">
      <h2 className="text-xl font-semibold mb-6">
       <span className="text-blue-600">{activeCounterTodo.title}</span>
      </h2>

      <div className="flex items-center justify-between">
   <button
    onMouseDown={(e) => e.preventDefault()}
    onClick={() => {
      updateCounter(activeCounterTodo.id, -1);
      inputRef.current?.focus();
    }}
    className="text-5xl px-4 text-red-500"
  >
    −
  </button>
<div className="flex flex-col items-center gap-3">
  <input
    ref={inputRef}
    type="tel"
    value={counterInputValue}
    onChange={(e) =>
      setCounterInputValue(e.target.value === '' ? '' : parseInt(e.target.value))
    }
    onKeyDown={(e) => {
      if (e.key === 'Enter') saveManualCounterValue();
    }}
    className="   font-mono text-center w-[5rem] border rounded-lg  appearance-none"
    min={0}
    style={{
    fontSize: '4rem',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'textfield',
    lineHeight: 1,
  
  }}
  />

  <button
    onClick={saveManualCounterValue}
  disabled={
  typeof counterInputValue !== 'number' ||
  (
    counterInputValue === (activeCounterTodo?.counter_value ?? 0) &&
    !snapshotsChanged()
  )
}

    className="px-4 py-1 text-sm rounded-lg border bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
  >
    Save
  </button>
</div>

   <button
    onMouseDown={(e) => e.preventDefault()}
    onClick={() => {
      updateCounter(activeCounterTodo.id, 1);
      inputRef.current?.focus();
    }}
    className="text-5xl px-4 text-green-500"
  >
    +
  </button>
      </div>
      
<button
  onClick={() => setAddMode(prev => !prev)}
  className={`px-4 py-1 text-sm rounded-lg border ${addMode ? 'bg-yellow-500' : 'bg-gray-300'} text-white hover:opacity-90`}
>
  {addMode ? 'Add Mode: ON' : 'Add Mode: OFF'}
</button>
{recentSnapshots.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-200 mb-2">
              Past 7 Days Snapshots
            </h3>
            <button
              onClick={() => setIsCollapsed(prev => !prev)}
              className="text-sm text-blue-400 underline focus:outline-none"
            >
              {isCollapsed ? 'Show' : 'Hide'}
            </button>
          </div>

          {!isCollapsed && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentSnapshots.map((snap) => (
                <div key={snap.id} className="flex items-center justify-between gap-4">
                  <span className="text-xs text-gray-300">
                    {new Date(snap.snap_at).toLocaleDateString()}
                  </span>
                  <input
                    type="tel"
                    value={snap.snapshot_value}
                    onChange={(e) => {
                      const newVal = parseInt(e.target.value) || 0;
                      setRecentSnapshots(prev =>
                        prev.map(s =>
                          s.id === snap.id ? { ...s, snapshot_value: newVal } : s
                        )
                      );
                    }}
                    className="w-24 p-1 text-sm rounded border bg-white text-black text-center"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}


    </div>
  </div>
)}

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Progress Circles Component
function ProgressCircles({ todos }: { todos: Todo[] }) {
  const getCategoryData = (): CategoryData[] => {
    return categories.map(category => {
      const categoryTodos = todos.filter(todo => todo.category === category);
      const completed = categoryTodos.filter(todo => todo.completed).length;
      const total = categoryTodos.length;
      const percentage = total > 0 ? (completed / total) * 100 : 0;
      
      return {
        name: category,
        icon: categoryIcons[category as keyof typeof categoryIcons],
        total,
        completed,
        percentage
      };
    });
  };

  const categoryData = getCategoryData();

  const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, category }: {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    category: CategoryData;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="opacity-30"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            strokeLinecap="round"
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="mb-1">
            {category.icon}
          </div>
          <div className="text-sm font-medium">
            {Math.round(percentage)}%
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <BarChart3 size={28} />
          Progress Overview
        </h2>
        <p className="">Track your completion progress across different categories</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {categoryData.map((category) => (
          <div
            key={category.name}
            className="flex flex-col items-center p-6 border rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mb-4">
              <CircularProgress
                percentage={category.percentage}
                category={category}
              />
            </div>
            
            <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
            
            <div className="text-center space-y-1">
              <p className="text-sm">
                {category.completed} of {category.total} completed
              </p>
              {category.total > 0 && (
                <div className="flex justify-center">
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(category.total, 10) }, (_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < category.completed 
                            ? 'opacity-100' 
                            : 'opacity-40'
                        }`}
                      />
                    ))}
                    {category.total > 10 && (
                      <span className="text-xs ml-1">+{category.total - 10}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border rounded-xl shadow-sm">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target size={24} />
          Overall Progress
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold mb-1">
              {todos.length}
            </div>
            <div className="text-sm">Total Tasks</div>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold mb-1">
              {todos.filter(todo => todo.completed).length}
            </div>
            <div className="text-sm">Completed</div>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold mb-1">
              {todos.length > 0 ? Math.round((todos.filter(todo => todo.completed).length / todos.length) * 100) : 0}%
            </div>
            <div className="text-sm">Overall Progress</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Combined App Component
export default function CombinedTodoApp() {
     const [content, setContent] = useState('');
     const [isLoading, setIsLoading] = useState(true);
     const [saveStatus, setSaveStatus] = useState('saved');
     const timeoutRef = useRef<NodeJS.Timeout | null>(null);
     const editorRef = useRef(null);
 
 
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeTab, setActiveTab] = useState<'todos' | 'progress'>('todos');
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [authLoading, setAuthLoading] = useState(true);
   const isAdmin = currentUserEmail === ADMIN_EMAIL;


  // Check if current user is admin
 
  
 const saveContent = async () => {
    try {
      const { error } = await supabase
        .from('text_content')
        .upsert({ 
          id: 1, 
          content: content,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving content:', error);
        setSaveStatus('error');
      } else {
        setSaveStatus('saved');
      }
    } catch (error) {
      console.error('Error:', error);
      setSaveStatus('error');
    }
  };

  


    const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('text_content')
        .select('content')
        .eq('id', 1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading content:', error);
      } else if (data) {
        setContent(data.content || '');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };
    const loadTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_email', ADMIN_EMAIL)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTodos(data || []);
    } catch (error) {
      console.error('Error loading todos:', error);
      alert('Error loading todos. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };
      // Load content on component mount
      useEffect(() => {
        loadContent();
      }, []);
    
      // Auto-save when content changes
      useEffect(() => {
        if (content && !isLoading) {
          setSaveStatus('saving...');
          
          // Clear existing timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          // Set new timeout for debounced save
          timeoutRef.current = setTimeout(() => {
            saveContent();
          }, 1000); // Save after 1 second of no typing
        }
    
        return () => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        };
      }, [content, isLoading]);
    

    
    
  useEffect(() => {
    // Initialize Firebase Auth
    const auth = getAuth(app);
    
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        setCurrentUserEmail(user.email);
        console.log('User authenticated:', user.email);
      } else {
        setCurrentUserEmail('');
        console.log('User not authenticated');
      }
      setAuthLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Only load todos if user is authenticated and is admin
    if (!authLoading && currentUserEmail && isAdmin) {
      loadTodos();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [currentUserEmail, authLoading, isAdmin]);

useEffect(() => {
  if (editorRef.current && content) {
    (editorRef.current as HTMLDivElement).innerText = content;
  }
}, [editorRef.current]); // run only once


  // Show loading screen while checking authentication
 
 
  // Load content on component mount


  // Auto-save when content changes
  useEffect(() => {
    if (content && !isLoading) {
      setSaveStatus('saving...');
      
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set new timeout for debounced save
      timeoutRef.current = setTimeout(() => {
        saveContent();
      }, 1000); // Save after 1 second of no typing
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, isLoading]);

 
 
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }
   if (authLoading || loading) {
    return <LoadingScreen />;
  }

  // Show auth required screen if user is not authenticated
  if (!currentUserEmail) {
    return <AuthRequired />;
  }

  // Show access denied if user is authenticated but not admin
  if (!isAdmin) {
    return <AccessDenied />;
  }
    if (isLoading) {
        return (
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-gray-600">Loading...</div>
          </div>
        );
      }
  return (
    <div className=" pt-6">
       
      <div className="max-w-6xl mx-auto px-6">
        {/* Header with navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">The Key : Die</h1>
            <p className="text-sm mt-1">
        every last bit left in you : die
            </p>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex border rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('todos')}
              className={`px-4 py-2 rounded-md transition-all ${
                activeTab === 'todos'
                  ? 'shadow-sm'
                  : 'hover:bg-opacity-20'
              }`}
            >
              Todo Manager
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`px-4 py-2 rounded-md transition-all ${
                activeTab === 'progress'
                  ? 'shadow-sm'
                  : 'hover:bg-opacity-20'
              }`}
            >
              Progress View
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 border rounded-lg shadow-sm">
            <div className="text-xl font-bold">
              {todos.length}
            </div>
            <div className="text-sm">Total Tasks</div>
          </div>
          <div className="text-center p-4 border rounded-lg shadow-sm">
            <div className="text-xl font-bold">
              {todos.filter(todo => todo.completed).length}
            </div>
            <div className="text-sm">Completed</div>
          </div>
          <div className="text-center p-4 border rounded-lg shadow-sm">
            <div className="text-xl font-bold">
              {todos.filter(todo => !todo.completed).length}
            </div>
            <div className="text-sm">Remaining</div>
          </div>
          <div className="text-center p-4 border rounded-lg shadow-sm">
            <div className="text-xl font-bold">
              {todos.length > 0 ? Math.round((todos.filter(todo => todo.completed).length / todos.length) * 100) : 0}%
            </div>
            <div className="text-sm">Overall Progress</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="border rounded-xl p-6 shadow-sm">
          {activeTab === 'todos' ? (
            <TodoApp todos={todos} onTodosChange={setTodos} userEmail={currentUserEmail} isAdmin={isAdmin} />
          ) : (
            <ProgressCircles todos={todos} />
          )}
        </div>

   
       <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className=" rounded-lg shadow-sm border border-gray-200 overflow-hidden">
     
        

    
          <div className="p-6">
    <textarea
  value={content}
  onChange={(e) => setContent(e.target.value)}
  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent leading-relaxed"
  style={{
    minHeight: '400px',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    resize: 'vertical',
  }}
/>

          </div>

   
        </div>
      </div>
    </div>
      </div>
    </div>
  );
}