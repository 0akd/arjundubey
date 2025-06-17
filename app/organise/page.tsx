"use client"
import React, { useState, useEffect } from 'react';
import { Plus, Check, Trash2, Edit2,RotateCcw, Target,BicepsFlexed,Flower, Brain,BrainCircuit, BookOpen, BarChart3, Loader2, Lock } from 'lucide-react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/firebase";
import supabase from '@/config/supabase';

interface Todo {
  id: number;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  created_at: string;
  user_email: string;
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
  'ProblemSolving',
  'Strength',
  'Spiritual',

];

const categoryIcons = {
  Intelligence: <Brain size={24} />,
  ProblemSolving: <BrainCircuit size={24} />,
 
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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Intelligence'
  });
  const [loading, setLoading] = useState(false);

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
            category: formData.category
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
            user_email: ADMIN_EMAIL
          }])
          .select()
          .single();

        if (error) throw error;

        onTodosChange([...todos, data]);
      }

      setFormData({ title: '', description: '', category: 'Intelligence' });
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
      category: todo.category
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingTodo(null);
    setFormData({ title: '', description: '', category: 'Intelligence' });
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
  if (!isAdmin) {
    alert('Only the administrator can reset todos.');
    return;
  }

  const completedTodos = todos.filter(todo => todo.completed);
  if (completedTodos.length === 0) {
    alert('No completed todos to reset.');
    return;
  }

  if (!confirm(`Are you sure you want to mark all ${completedTodos.length} completed todos as incomplete?`)) {
    return;
  }

  setLoading(true);
  try {
    const { error } = await supabase
      .from('todos')
      .update({ completed: false })
      .eq('user_email', ADMIN_EMAIL)
      .eq('completed', true);

    if (error) throw error;

    const updatedTodos = todos.map(todo => ({ ...todo, completed: false }));
    onTodosChange(updatedTodos);
    
    alert(`Successfully reset ${completedTodos.length} todos to incomplete status.`);
  } catch (error) {
    console.error('Error resetting todos:', error);
    alert('Error resetting todos. Please try again.');
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

  return (

 <div className="space-y-6">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold">Todo Manager</h2>
        {isAdmin && (
          <span className="px-2 py-1 text-xs rounded-full font-medium">
            Admin Access
          </span>
        )}
        {!isAdmin && (
          <span className="px-2 py-1 text-xs rounded-full font-medium">
            Read Only
          </span>
        )}
      </div>
      
      <div className="flex gap-3">
        {isAdmin ? (
          <>
            <button
              onClick={resetAllTodos}
              className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              disabled={loading || todos.filter(todo => todo.completed).length === 0}
              title={todos.filter(todo => todo.completed).length === 0 ? 'No completed todos to reset' : 'Reset all completed todos'}
            >
              <RotateCcw size={20} />
              Reset All ({todos.filter(todo => todo.completed).length})
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors"
              disabled={loading}
            >
              <Plus size={20} />
              Add Todo
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-not-allowed">
            <Lock size={20} />
            Admin Only
          </div>
        )}
      </div>
    </div>

    {!isAdmin && (
      <div className="border rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Lock size={16} />
          <p className="text-sm">
            <strong>Read-only mode:</strong> Only reboostify@gmail.com can add, edit, or delete todos. You can view all todos and progress.
          </p>
        </div>
      </div>
    )}

      {showForm && isAdmin && (
        <div className="border rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">
            {editingTodo ? 'Edit Todo' : 'Add New Todo'}
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Todo title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
              disabled={loading}
            />
            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border rounded-lg h-24 resize-none focus:outline-none focus:ring-2"
              disabled={loading}
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
              disabled={loading}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={addTodo}
                className="flex items-center gap-2 px-6 py-2 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {editingTodo ? 'Update Todo' : 'Add Todo'}
              </button>
              <button
                onClick={cancelEdit}
                className="px-6 py-2 border rounded-lg hover:bg-opacity-10 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {categories.map(category => {
          const categoryTodos = getTodosByCategory(category);
          const completionPercentage = getCompletionPercentage(category);
          
          return (
            <div key={category} className="border rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  {categoryIcons[category as keyof typeof categoryIcons]}
                  {category}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm">
                    {categoryTodos.filter(t => t.completed).length}/{categoryTodos.length} completed
                  </span>
                  <div className="w-12 h-12 relative">
                    <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="100, 100"
                        className="opacity-30"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={`${completionPercentage}, 100`}
                        className="transition-all duration-500 ease-in-out"
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

              <div className="space-y-3">
                {categoryTodos.length === 0 ? (
                  <p className="italic">No todos in this category</p>
                ) : (
                  categoryTodos.map(todo => (
                    <div
                      key={todo.id}
                      className={`flex items-start gap-3 p-4 border rounded-lg transition-all ${
                        todo.completed ? 'opacity-75' : 'hover:shadow-sm'
                      }`}
                    >
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-all ${
                          todo.completed 
                            ? '' 
                            : 'border-opacity-30 hover:border-opacity-70'
                        } ${!isAdmin ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                        disabled={!isAdmin}
                        title={!isAdmin ? 'Admin access required' : 'Toggle completion'}
                      >
                        {todo.completed && <Check size={14} />}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium ${todo.completed ? 'line-through' : ''}`}>
                          {todo.title}
                        </h4>
                        {todo.description && (
                          <p className={`text-sm mt-1 ${todo.completed ? 'line-through' : ''}`}>
                            {todo.description}
                          </p>
                        )}
                        <p className="text-xs mt-1">
                          Created {new Date(todo.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => editTodo(todo)}
                          className={`flex-shrink-0 p-1 transition-colors ${
                            isAdmin 
                              ? 'cursor-pointer hover:opacity-80' 
                              : 'cursor-not-allowed opacity-40'
                          }`}
                          disabled={!isAdmin}
                          title={!isAdmin ? 'Admin access required' : 'Edit todo'}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className={`flex-shrink-0 p-1 transition-colors ${
                            isAdmin 
                              ? 'cursor-pointer hover:opacity-80' 
                              : 'cursor-not-allowed opacity-40'
                          }`}
                          disabled={!isAdmin}
                          title={!isAdmin ? 'Admin access required' : 'Delete todo'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
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
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeTab, setActiveTab] = useState<'todos' | 'progress'>('todos');
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [authLoading, setAuthLoading] = useState(true);

  // Check if current user is admin
  const isAdmin = currentUserEmail === ADMIN_EMAIL;

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

  // Show loading screen while checking authentication
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
 const text: string =" we all have two people, we all have two people, and i'm not saying you're crazy, we have the easy voice, that's that voice that we all love, that's that very comfortable voice, that's that mommy holding you, saying it's going to be okay, it doesn't care how good you are, just loves you, just loves you, no matter how messed up you are in life, so that's that one voice, this other voice that we walk very far away from is a boy saying, hey man, you ain't doing shit, so we try to get this voice out of our head completely, and we live over here in this lane, so what you have to do first is turn up this voice over here, the voice saying things to you that aren't nice, that it's in our heads saying, you know what man, dude, you're not, you're not doing it, i'm not saying to put yourself down, i'm saying listen to the truth, and the truth isn't in the 20 percent, the truth is in this other part of your brain saying, look man, you're wasting a bunch of percentage here, we have 80 more percent that we're not tapping into, because in this other 80 is suffering, pain, failure, failure, failure, self-doubt, darkness, and then a whole bunch of light, but to get to this light, you gotta go through all of this journey, which is not fun, so a lot of us know that i can get over here, but over here man, this is much better, because i gotta go through this journey that is not fun, this, this from 20 to 100 percent, this [ __ ] in between is not fun, so we decided to live over here, so everybody goes, how do you do that, you know exactly how to do that, you know exactly, it's not a magic trick, there's nothing i talk about that's a magic trick, it's all back down to a very primitive mindset of, we just have to do, it's like breathing, breathing becomes normal, like we don't know that, that, that we're doing, that's how you have to live your life, when that alarm clock goes off at four or five in the morning, your mind says no, you just say, this is what we do, it's what we do now, because to get to where you want to go, the amount of pain involved, i'm not saying physical, i'm not saying you gotta break yourself off, the amount of mental pain, of how many times you're gonna have to do something that you don't want to do to get to where you want to go, when i was 297 pounds and i was fat as hell, trying to be a navy seal, the scariest thing in the world to me, even to this day, was that, that could have been the rest of my life, i thought then i was trying hard, that's the scariest thing in the world, i thought then, 297 pounds, working for eco labs, spraying for cockroaches, making a thousand dollars a month, i thought that was me at my 100 percent potential, coming to find out a few years later, i wasn't anywhere near that, 106 pounds less, graduate navy seal training, we're going to do all these other things, looking back on that, that was me trying hard, that's why people gotta understand, what is in us, we have no idea until we start trying hard, and i mean really trying hard, when you're obsessed with, hey, this is my new norm, my new norm is that, wow, this isn't always fun, it's not always meant to be fun, and that's when you know you're trying hard, is that, and so people listening to us, that maybe are at 20 or 30, you know, about yeah, i'm going hard, i'm going max, and yet they're not seeing the results, like how do they actually shape themselves out of that, we're all in a battle with our own brains, that's like, that's all life is, it's the most proper thing in the world, is your own brain, it could work for you or against you, and as opposed to focusing on all those bad things that happened, all the things you didn't have, the people that called you names, all the stuff you're doing again, and you started thinking, wait a second, i just visualized this, and now i can take it to the next level, next level, because the visualization got you through, it did, and i was able to visualize the end, so before, so when i was 297, i was all fat and out of shape, i couldn't run a quarter mile, and i was drinking milkshakes and eating boxes of donuts, i visualized, man, how would it feel, for a brief moment, i was so, there was 22 guys that graduated, i watched this segment on tv about these guys going to navy seal training, and i couldn't even, i, i wasn't a great swimmer, i was afraid of the water, all this crap, man, but at the very end it says, 22 guys, there's command officers up there, and it gives this great speech, i was like, man, i wonder, so i started visualizing me being the 23rd guy, in these dress whites, sitting there with these guys, getting that navy seal, you know, graduating this navy seal training, i was like, god, so i put myself there, i was like, man, that's an amazing feeling, i put myself there at 297, not even able to do anything that these great men were doing, [Music] you get that certificate, you walk across the stage, and what's next, but i didn't know that then, my mind was that, i thought i lived in that moment forever, so i said, wow man, if i could just feel like that, i could feel like these guys feel, and what was that feeling you wanted so bad, no, victory, i wanted to win, not like beat somebody else, it wasn't about that, i, i just wanted to go the distance, everything in my life, when something got hard, i quit, if it was reading, that's why, you know, i wasn't great at reading, i wasn't great at writing, so i just quit, i couldn't catch on as fast as you, i didn't work harder than you, so i quit, you know, i wasn't great at things, so i quit, you know, i'm, i'm not good at this, like man, if i could just go that distance, that extra mile, to just go, just to finish, i want to finish, i want to feel victory, and victory for me wasn't winning, it was just finishing, so i said, you know what, if i could feel like these guys feel, it would change my life, but what i realized, the best feeling i had was when i was by myself, trying to lose this weight, i had to lose it in literally less than three months, 106 pounds, less than three months, and literally, i started feeling victory just by putting myself in the battle, it wasn't about going to navy seal training, it wasn't about being the 23rd guy in that chair, i started realizing, man, just by going to war with myself every day, and putting these challenges, and these goals, and these obstacles, these insurmountable obstacles, so it went about losing 106 pounds, me losing five pounds was an accomplishment, me losing 10 pounds, and then 50 pounds, and the more i just, the more i gained confidence, and then the more i gained confidence, the more i realized, these guys can't do what i'm doing right now, i had no coach, had no trainer, had no money, i didn't know how to lose weight, i had no knowledge of what i was doing, i was just working, i was just sacrificing, and then through that, all these different tools started coming up, but i would have never found these tools if i didn't put myself in a very uncomfortable place, we all look for toughness, we all want it, but we look for it in a comfortable environment, you will not find toughness in a comfortable environment, those of you who are listening to this, whoever hear this, you will not find it,trijya choubey dumped you worthless jobless berozgar and she went to tarun kaushik, may be she deserses but you punk get start to work your ass off,how your father did the dirty things ,how yout friend pulled your hair while doing pushups"
;
  return (
    <div className="min-h-screen pt-6">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header with navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Todo App with Progress Tracking</h1>
            <p className="text-sm mt-1">
              Logged in as: <span className="font-medium">{currentUserEmail}</span>
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

        {/* Quick Actions Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm">
            {activeTab === 'todos' 
              ? 'Switch to Progress View to see detailed completion statistics'
              : 'Switch to Todo Manager to add, edit, or complete tasks'
            }
          </p>
        </div>
   <div className="max-w-2xl mx-auto p-6 sm:p-8 md:p-10">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">Welcome to Our Platform</h1>
      <ul className="list-disc pl-5 sm:pl-6 space-y-2 sm:space-y-3">
        {text.split(',').map((item: string, index: number) => (
          <li key={index} className="text-base sm:text-lg">{item.trim()}</li>
        ))}
      </ul>
    </div>
      </div>
    </div>
  );
}