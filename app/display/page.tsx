"use client"
import React, { useState, useEffect } from 'react';
import { Brain, BrainCircuit, BicepsFlexed, Flower, Target, BarChart3, TrendingUp, Trophy, Loader2 } from 'lucide-react';
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
  color: string;
}

const categories = [
  'Intelligence',
  'ProblemSolving',
  'Strength',
  'Spiritual',
];

const categoryConfig = {
  Intelligence: { 
    icon: <Brain size={24} />, 
    color: 'from-blue-500 to-blue-600',

    textColor: 'text-blue-600'
  },
  ProblemSolving: { 
    icon: <BrainCircuit size={24} />, 
    color: 'from-purple-500 to-purple-600',

    textColor: 'text-purple-600'
  },
  Strength: { 
    icon: <BicepsFlexed size={24} />, 
    color: 'from-orange-500 to-orange-600',

    textColor: 'text-orange-600'
  },
  Spiritual: { 
    icon: <Flower size={24} />, 
    color: 'from-green-500 to-green-600',

    textColor: 'text-green-600'
  }
};

// Admin email to fetch data from
const ADMIN_EMAIL = 'reboostify@gmail.com';

// Loading Component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
        <p className="text-gray-600">Loading progress data...</p>
      </div>
    </div>
  );
}

// Circular Progress Component
function CircularProgress({ percentage, size = 120, strokeWidth = 8, color = "text-blue-500" }: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
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
          className="text-gray-200"
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
          className={`transition-all duration-1000 ease-out ${color}`}
          strokeLinecap="round"
        />
      </svg>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`text-xl font-bold ${color}`}>
          {Math.round(percentage)}%
        </div>
      </div>
    </div>
  );
}

// Main Public Progress View Component
export default function PublicProgressView() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_email', ADMIN_EMAIL)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTodos(data || []);
    } catch (error) {
      console.error('Error loading todos:', error);
      setError('Failed to load progress data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryData = (): CategoryData[] => {
    return categories.map(category => {
      const categoryTodos = todos.filter(todo => todo.category === category);
      const completed = categoryTodos.filter(todo => todo.completed).length;
      const total = categoryTodos.length;
      const percentage = total > 0 ? (completed / total) * 100 : 0;
      const config = categoryConfig[category as keyof typeof categoryConfig];
      
      return {
        name: category,
        icon: config.icon,
        total,
        completed,
        percentage,
        color: config.color
      };
    });
  };

  const getOverallStats = () => {
    const totalTodos = todos.length;
    const completedTodos = todos.filter(todo => todo.completed).length;
    const overallPercentage = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;
    
    return {
      totalTodos,
      completedTodos,
      remainingTodos: totalTodos - completedTodos,
      overallPercentage
    };
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">⚠️</div>
        <p className=" mb-4">{error}</p>
        <button 
          onClick={loadTodos}
          className="px-4 py-2 bg-blue-500  rounded-lg hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const categoryData = getCategoryData();
  const overallStats = getOverallStats();

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
    <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
       Stats
        </h2>
        <p className="text-lg">
        my realtime progress
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br  p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Target className="text-blue-600" size={24} />
            <div className="text-2xl font-bold text-blue-700">{overallStats.totalTodos}</div>
          </div>
          <div className="text-blue-600 font-medium">Total Goals</div>
        </div>

        <div className="bg-gradient-to-br  p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="text-green-600" size={24} />
            <div className="text-2xl font-bold text-green-700">{overallStats.completedTodos}</div>
          </div>
          <div className="text-green-600 font-medium">Completed</div>
        </div>

        <div className="bg-gradient-to-br  p-6 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-orange-600" size={24} />
            <div className="text-2xl font-bold text-orange-700">{overallStats.remainingTodos}</div>
          </div>
          <div className="text-orange-600 font-medium">In Progress</div>
        </div>

        <div className="bg-gradient-to-br  p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="text-purple-600" size={24} />
            <div className="text-2xl font-bold text-purple-700">{Math.round(overallStats.overallPercentage)}%</div>
          </div>
          <div className="text-purple-600 font-medium">Overall Progress</div>
        </div>
      </div>

      {/* Category Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categoryData.map((category) => {
          const config = categoryConfig[category.name as keyof typeof categoryConfig];
          return (
            <div
              key={category.name}
              className={` p-6 rounded-xl border  hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="text-center">
                <div className="mb-4">
                  <CircularProgress
                    percentage={category.percentage}
                    size={100}
                    strokeWidth={6}
                    color={config.textColor}
                  />
                </div>
                
                <div className={`${config.textColor} mb-2`}>
                  {category.icon}
                </div>
                
                <h3 className={`text-lg font-semibold mb-2 ${config.textColor}`}>
                  {category.name}
                </h3>
                
                <div className="space-y-2">
                  <p className="text-sm ">
                    {category.completed} of {category.total} completed
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="w-full  rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${config.color} h-2 rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                  
                  {/* Mini dots indicator */}
                  {category.total > 0 && (
                    <div className="flex justify-center">
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(category.total, 8) }, (_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              i < category.completed 
                                ? config.textColor.replace('text-', 'bg-')
                                : 'bg-gray-300'
                            }`}
                          />
                        ))}
                        {category.total > 8 && (
                          <span className="text-xs text-gray-500 ml-1">+{category.total - 8}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Progress Section */}
      <div className="bg-gradient-to-r  p-8 rounded-xl border">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-6 ">Overall Achievement</h3>
          
          <div className="flex justify-center mb-6">
            <CircularProgress
              percentage={overallStats.overallPercentage}
              size={150}
              strokeWidth={10}
              color="text-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold  mb-1">
                {overallStats.totalTodos}
              </div>
              <div className="">Total Tasks Set</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {overallStats.completedTodos}
              </div>
              <div className="">Successfully Completed</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {Math.round(overallStats.overallPercentage)}%
              </div>
              <div className="">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center  text-sm">
        <p>Data updates in real-time • Last updated: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}