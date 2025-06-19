"use client"
import React, { useState, useEffect } from 'react';
import { Brain, BrainCircuit, AppWindowMac, BicepsFlexed, Flower, Target, BarChart3, TrendingUp, Trophy, Loader2 } from 'lucide-react';

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
  'Websites',
];

const categoryConfig = {
  Intelligence: { 
    icon: <Brain size={18} />, 
    color: 'from-blue-400 to-blue-500',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-600'
  },
  Websites: { 
    icon: <AppWindowMac size={18} />, 
    color: 'from-yellow-400 to-yellow-500',
    borderColor: 'border-yellow-400',
    textColor: 'text-yellow-600'
  },
  ProblemSolving: { 
    icon: <BrainCircuit size={18} />, 
    color: 'from-purple-400 to-purple-500',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-600'
  },
  Strength: { 
    icon: <BicepsFlexed size={18} />, 
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

// Mock data for demonstration
const mockTodos: Todo[] = [
  { id: 1, title: "Learn React", description: "", category: "Intelligence", completed: true, created_at: "2024-01-01", user_email: "test@test.com" },
  { id: 2, title: "Build Portfolio", description: "", category: "Websites", completed: false, created_at: "2024-01-02", user_email: "test@test.com" },
  { id: 3, title: "Solve Algorithm", description: "", category: "ProblemSolving", completed: true, created_at: "2024-01-03", user_email: "test@test.com" },
  { id: 4, title: "Workout", description: "", category: "Strength", completed: true, created_at: "2024-01-04", user_email: "test@test.com" },
  { id: 5, title: "Meditation", description: "", category: "Spiritual", completed: false, created_at: "2024-01-05", user_email: "test@test.com" },
  { id: 6, title: "JavaScript Deep Dive", description: "", category: "Intelligence", completed: true, created_at: "2024-01-06", user_email: "test@test.com" },
  { id: 7, title: "E-commerce Site", description: "", category: "Websites", completed: true, created_at: "2024-01-07", user_email: "test@test.com" },
  { id: 8, title: "Data Structures", description: "", category: "ProblemSolving", completed: false, created_at: "2024-01-08", user_email: "test@test.com" },
];

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
  const [todos, setTodos] = useState<Todo[]>(mockTodos);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="w-full max-w-5xl mx-auto p-3 sm:p-6 space-y-4">
      {/* Compact Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Progress Stats
        </h1>
        <p className="text-sm text-gray-600">Real-time progress tracking</p>
      </div>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="border-2 border-blue-300 rounded-xl p-3 hover:border-blue-400 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <Target className="text-blue-500" size={16} />
            <span className="text-lg font-bold text-blue-600">{overallStats.totalTodos}</span>
          </div>
          <p className="text-xs text-blue-600 font-medium">Total</p>
        </div>

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

        <div className="border-2 border-purple-300 rounded-xl p-3 hover:border-purple-400 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <BarChart3 className="text-purple-500" size={16} />
            <span className="text-lg font-bold text-purple-600">{Math.round(overallStats.overallPercentage)}%</span>
          </div>
          <p className="text-xs text-purple-600 font-medium">Success</p>
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
                <div className="w-full bg-gray-200 rounded-full h-1.5">
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
                              : 'bg-gray-300'
                          }`}
                        />
                      ))}
                      {category.total > 5 && (
                        <span className="text-xs text-gray-400 ml-1">+{category.total - 5}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Compact Overall Progress */}
      <div className="border-2 border-gradient-to-r border-blue-300 rounded-xl p-4 text-center">
        <h3 className="text-lg font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Overall Success Rate
        </h3>
        
        <div className="flex justify-center mb-3">
          <CompactCircularProgress
            percentage={overallStats.overallPercentage}
            size={80}
            strokeWidth={6}
            color="text-blue-500"
          />
        </div>
        
        <div className="text-xs text-gray-500">
          {overallStats.completedTodos} of {overallStats.totalTodos} goals completed
        </div>
      </div>

      {/* Compact Footer */}
      <div className="text-center text-xs text-gray-400 pt-2">
        <p>Live updates • {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}