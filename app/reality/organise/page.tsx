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



// Main Combined App Component
export default function CombinedTodoApp() {
 
 
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeTab, setActiveTab] = useState<'todos' | 'progress'>('todos');
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [authLoading, setAuthLoading] = useState(true);
const isAdmin = ADMIN_EMAILS.includes(currentUserEmail);



  // Check if current user is admin
 
  
 
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
   
  return (
    <div className=" ">
     <TodoApp
  todos={todos}
  onTodosChange={setTodos}
  userEmail={currentUserEmail}
  isAdmin={isAdmin}
/>

   
    </div>
  );
}