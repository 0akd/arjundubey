import React, { useState , useRef, useEffect } from 'react';
import CounterSnapshot from './todosnapshot'
import type { Todo, CategoryData } from './types';
import supabase from '@/config/supabase';
import { Plus, Check,ChevronDown, Trash2,IndianRupee, Edit2,RotateCcw,BicepsFlexed,Flower, Brain,StretchVertical,  Loader2, Lock } from 'lucide-react';
const categories = [
  'Intelligence',
  'Flexibility',
  'Strength',
  'Spiritual',
  'Money'

];
const ADMIN_EMAILS = ['reboostify@gmail.com', 'unidimensia@gmail.com'];
const categoryIcons = {
  Intelligence: <Brain size={24} />,
  Flexibility: <StretchVertical size={24} />,
 
Money: <IndianRupee size={24} />,
  Strength: <BicepsFlexed size={24} />,
  Spiritual: <Flower size={24} />
};

export default function TodoApp({ todos, onTodosChange, userEmail, isAdmin }: { 
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
  counter_value: 0  ,
    is_timer: false, // ✅ new
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
const [activeTimerTodo, setActiveTimerTodo] = useState<Todo | null>(null);
const [elapsed, setElapsed] = useState(0);
const [timerRunning, setTimerRunning] = useState(false);
const [manualTimerValue, setManualTimerValue] = useState<number | ''>('');

const timerRef = useRef<NodeJS.Timeout | null>(null);
useEffect(() => {
  if (timerRunning) {
    timerRef.current = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
  } else {
    clearInterval(timerRef.current!);
  }
  return () => clearInterval(timerRef.current!);
}, [timerRunning]);







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
  is_timer: formData.is_timer,

  counter_value: formData.counter_value
})

          .eq('id', editingTodo.id)
          .in('user_email', ADMIN_EMAILS);

        if (error) throw error;

        const updatedTodos = todos.map(todo => 
          todo.id === editingTodo.id 
            ? { ...todo, title: formData.title, description: formData.description, category: formData.category }
            : todo
        );
        onTodosChange(updatedTodos);
        setEditingTodo(null);
      } else {
      
       const { data, error } = await supabase
  .from('todos')
  .insert([{
    title: formData.title,
    description: formData.description,
    category: formData.category,
    completed: false,
user_email: userEmail, // ✅ correct: insert the currently logged-in user's email
is_timer: formData.is_timer,

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
    is_timer: false, // ✅ new
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
  is_timer: formData.is_timer,

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
    is_timer: false, // ✅ new
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
        .in('user_email', ADMIN_EMAILS);

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


    const { error: insertError } = await supabase
      .from('counter_snapshots')
      .insert(snapshots);

    if (insertError) throw insertError;

  
    for (const todo of counterTodos) {
      await supabase.rpc('prune_old_snapshots', { target_todo_id: todo.id });
    }

  
    const { error: counterResetError } = await supabase
      .from('todos')
      .update({ counter_value: 0 })
      .in('user_email', ADMIN_EMAILS)
      .eq('is_counter', true);

    if (counterResetError) throw counterResetError;

    const { error: uncheckError } = await supabase
      .from('todos')
      .update({ completed: false })
      .eq('user_email', ADMIN_EMAILS)
      .eq('completed', true);

    if (uncheckError) throw uncheckError;

  
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
        .eq('user_email', ADMIN_EMAILS);

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
      .eq('user_email', ADMIN_EMAILS);

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
        .eq('user_email', ADMIN_EMAILS);

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


    for (const snap of recentSnapshots) {
      const { error } = await supabase
        .from('counter_snapshots')
        .update({ snapshot_value: snap.snapshot_value })
        .eq('id', snap.id);

      if (error) {
        console.error(`Failed to update snapshot ID ${snap.id}:`, error);
      }
    }


    if (addMode) {
      setCounterInputValue(0);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }
};

useEffect(() => {
  if (addMode && inputRef.current) {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50); // short delay helps with mobile keyboard
  }
}, [addMode]);

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
  value={formData.is_counter ? 'counter' : formData.is_timer ? 'timer' : 'checkbox'}
  onChange={(e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      is_counter: value === 'counter',
      is_timer: value === 'timer',
    });
  }}
>
  <option value="checkbox">Checkbox</option>
  <option value="counter">Counter</option>
  <option value="timer">Timer</option>
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
  } else if (todo.is_timer && isAdmin) {
    setActiveTimerTodo(todo);
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
                            }`}>{todo.is_timer && (
  <p className="text-xs text-blue-600 mt-1 font-mono">
    Timer: {new Date((todo.timer_value ?? 0) * 1000).toISOString().substr(11, 8)}
  </p>
)}

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
  if (addMode) {
    setCounterInputValue(prev => Math.max(0, (typeof prev === 'number' ? prev : 0) - 1));
  } else {
    updateCounter(activeCounterTodo.id, -1);
  }
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
    className="   font-mono text-center w-[7rem] border rounded-lg  appearance-none"
    min={0}
    style={{
    fontSize: '4rem',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'textfield',
    lineHeight: 1,
  
  }}
  />

{!addMode && (
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
)}

  {addMode && (
  <button
    onClick={saveManualCounterValue}
    disabled={typeof counterInputValue !== 'number' || counterInputValue <= 0}
    className="px-4 py-1 text-sm rounded-lg border bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
  >
    Add
  </button>
)}


</div>

   <button
    onMouseDown={(e) => e.preventDefault()}
onClick={() => {
  if (addMode) {
    setCounterInputValue(prev => Math.max(0, (typeof prev === 'number' ? prev : 0) + 1));
  } else {
    updateCounter(activeCounterTodo.id, 1);
  }
  inputRef.current?.focus();
}}

    className="text-5xl px-4 text-green-500"
  >
    +
  </button>
      </div>
      
<button
  onMouseDown={(e) => e.preventDefault()}
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
)}{activeTimerTodo && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center space-y-4">
      <h2 className="text-lg font-bold">{activeTimerTodo.title}</h2>
      <p className="text-4xl font-mono">{new Date(elapsed * 1000).toISOString().substr(11, 8)}</p>
      <input
  type="number"
  min={0}
  className="w-full p-2 border rounded text-center font-mono"
  value={manualTimerValue}
  onChange={(e) =>
    setManualTimerValue(e.target.value === '' ? '' : parseInt(e.target.value))
  }
/>
<button
  onClick={async () => {
    if (
      typeof manualTimerValue === 'number' &&
      activeTimerTodo
    ) {
      try {
        const { error } = await supabase
          .from('todos')
          .update({ timer_value: manualTimerValue })
          .eq('id', activeTimerTodo.id)
          .eq('user_email', userEmail);

        if (error) throw error;

        onTodosChange(
          todos.map(todo =>
            todo.id === activeTimerTodo.id
              ? { ...todo, timer_value: manualTimerValue }
              : todo
          )
        );
        alert('Timer value updated!');
      } catch (err) {
        console.error('Failed to update timer manually:', err);
        alert('Error updating timer value.');
      }
    }
  }}
  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
>
  Save Timer Value
</button>

      <div className="flex justify-center gap-4">
        <button
       onClick={async () => {
  if (timerRunning) {
    setTimerRunning(false);

    // ✅ Save timer value to Supabase
    if (activeTimerTodo) {
        if (activeTimerTodo) {
  setManualTimerValue(activeTimerTodo.timer_value ?? 0);
}

      try {
        const { error } = await supabase
  .from('todos')
  .update({ timer_value: (activeTimerTodo.timer_value ?? 0) + elapsed })

          .eq('id', activeTimerTodo.id)
          .eq('user_email', userEmail); // optional: restrict by email

        if (error) throw error;
      } catch (err) {
        console.error('Failed to save timer:', err);
        alert('Failed to save timer to database.');
      }
    }onTodosChange(
  todos.map(todo =>
    todo.id === activeTimerTodo.id
      ? { ...todo, timer_value: (todo.timer_value ?? 0) + elapsed }
      : todo
  )
);

  } else {
    setTimerRunning(true);
  }
}}

          className={`px-4 py-2 text-white rounded-lg ${timerRunning ? 'bg-red-500' : 'bg-green-500'}`}
        >
          {timerRunning ? 'Stop' : 'Start'}
        </button>
        <button
          onClick={() => {
            setTimerRunning(false);
            setElapsed(0);
          }}
          className="px-4 py-2 bg-gray-300 rounded-lg"
        >
          Reset
        </button>
      </div>
      <button
        onClick={() => {
          setTimerRunning(false);
          setActiveTimerTodo(null);
          setElapsed(0);
        }}
        className="text-sm text-gray-600 underline"
      >
        Close
      </button>
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