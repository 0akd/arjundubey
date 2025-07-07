"use client"
import React, { useState , useRef, useEffect } from 'react';
import { Plus, Check,ChevronDown, Trash2,IndianRupee, Edit2,RotateCcw, Target,BicepsFlexed,Flower, Brain,StretchVertical, BookOpen, BarChart3, Loader2, Lock } from 'lucide-react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/firebase";
import supabase from '@/config/supabase';
import TodoApp from './todo'
import type { Todo, CategoryData } from './types';




// Hardcoded admin email
const ADMIN_EMAILS = ['reboostify@gmail.com', 'unidimensia@gmail.com'];


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
const isAdmin = ADMIN_EMAILS.includes(currentUserEmail);



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
        .in('user_email', ADMIN_EMAILS)
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
    <div className=" ">
         <div className="border rounded-xl p-6 shadow-sm">
          {activeTab === 'todos' ? (
            <TodoApp todos={todos} onTodosChange={setTodos} userEmail={currentUserEmail} isAdmin={isAdmin} />
          ) : (
            <ProgressCircles todos={todos} />
          )}
        </div>
      <div className="max-w-6xl mx-auto 6">
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