"use client"
import React, { useState, useEffect } from 'react';
import { Brain, StretchVertical, IndianRupee, Zap, Flower, Target, BarChart3, TrendingUp, Trophy, Loader2 } from 'lucide-react';
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
  'Flexibility',
  'Strength',
  'Spiritual',
  'Money',
];

const categoryConfig = {
  Intelligence: { 
    icon: <Brain size={18} />, 
    color: 'from-blue-400 to-blue-500',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-600'
  },
  Money: { 
    icon: <IndianRupee size={18} />, 
    color: 'from-yellow-400 to-yellow-500',
    borderColor: 'border-yellow-400',
    textColor: 'text-yellow-600'
  },
  Flexibility: { 
    icon: <StretchVertical size={18} />, 
    color: 'from-purple-400 to-purple-500',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-600'
  },
  Strength: { 
    icon: <Zap size={18} />, 
    color: 'from-orange-400 to-orange-500',
    borderColor: 'border-orange-400',
    textColor: 'text-orange-600'
  },
  Spiritual: { 
    icon: <Flower size={18} />, 
    color: 'from-green-400 to-green-500',
    borderColor: 'border-green-400',
    textColor: 'text-green-600'
  }
};



// Loading Component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-4 text-blue-500" />
        <p className="text-sm text-gray-600">Loading progress data...</p>
      </div>
    </div>
  );
}

// Compact Circular Progress Component
function CompactCircularProgress({ percentage, size = 60, strokeWidth = 4, color = "text-blue-500" }: {
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
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-transparent"
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
          className={`transition-all duration-700 ease-out ${color}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`text-sm font-bold ${color}`}>
          {Math.round(percentage)}%
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function CompactProgressDashboard() {
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

  const categoryData = getCategoryData();
  const overallStats = getOverallStats();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12 px-4">
        <div className="text-red-500 mb-4 text-2xl">⚠️</div>
        <p className="text-gray-700 mb-4">{error}</p>
        <button 
          onClick={loadTodos}
          className="px-4 py-2 border-2 border-blue-400 text-blue-600 rounded-lg hover:border-blue-500 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-3 sm:p-6 space-y-4">
      {/* Compact Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Progress
        </h1>
       <p>A person's identity is sum total of the daily habits he has</p>
      </div>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
       

        <div className="border-2 border-green-300 rounded-xl p-3 hover:border-green-400 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <Trophy className="text-green-500" size={16} />
            <span className="text-lg font-bold text-green-600">{overallStats.completedTodos}</span>
          </div>
          <p className="text-xs text-green-600 font-medium">Done</p>
        </div>

        <div className="border-2 border-orange-300 rounded-xl p-3 hover:border-orange-400 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <TrendingUp className="text-orange-500" size={16} />
            <span className="text-lg font-bold text-orange-600">{overallStats.remainingTodos}</span>
          </div>
          <p className="text-xs text-orange-600 font-medium">Active</p>
        </div>

   
      </div>

      {/* Compact Category Grid - 3 columns on mobile, 5 on larger screens */}
      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {categoryData.map((category) => {
          const config = categoryConfig[category.name as keyof typeof categoryConfig];
          return (
            <div
              key={category.name}
              className={`border-2 ${config.borderColor} rounded-xl p-3 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 group`}
            >
              <div className="text-center space-y-2">
                {/* Icon and Progress Circle */}
                <div className="flex flex-col items-center space-y-2">
                  <div className={`${config.textColor} group-hover:scale-110 transition-transform`}>
                    {category.icon}
                  </div>
                  <CompactCircularProgress
                    percentage={category.percentage}
                    size={45}
                    strokeWidth={3}
                    color={config.textColor}
                  />
                </div>
                
                {/* Category Name - truncated for mobile */}
                <h3 className={`text-xs font-semibold ${config.textColor} truncate`}>
                  {category.name.length > 8 ? category.name.substring(0, 8) + '...' : category.name}
                </h3>
                
                {/* Compact Stats */}
                <div className="text-xs text-gray-600">
                  {category.completed}/{category.total}
                </div>
                
                {/* Mini Progress Bar */}
                <div className="w-full  rounded-full h-1.5">
                  <div 
                    className={`bg-gradient-to-r ${config.color} h-1.5 rounded-full transition-all duration-700 ease-out`}
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
                
                {/* Dot Indicators - only show on larger screens */}
                {category.total > 0 && (
                  <div className="hidden sm:flex justify-center">
                    <div className="flex gap-0.5">
                      {Array.from({ length: Math.min(category.total, 5) }, (_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                            i < category.completed 
                              ? config.textColor.replace('text-', 'bg-')
                              : ''
                          }`}
                        />
                      ))}
                      {category.total > 5 && (
                        <span className="text-xs  ml-1">+{category.total - 5}</span>
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