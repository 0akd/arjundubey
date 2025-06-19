"use client"
import React, { useState, useEffect } from 'react';
import { Trophy, Target, TrendingUp, Calendar, Star, Award } from 'lucide-react';

// Define the type for LeetCode stats
interface LeetCodeStats {
  totalSolved: number;
  totalQuestions: number;
  easySolved: number;
  totalEasy: number;
  mediumSolved: number;
  totalMedium: number;
  hardSolved: number;
  totalHard: number;
  acceptanceRate: number;
  ranking?: number;
  contributionPoints?: number;
  reputation?: number;
  submissionCalendar?: Record<string, number>;
}

export default function LeetCodeStatsCard() {
  const [stats, setStats] = useState<LeetCodeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const leetcodeId = "h7O7p66Vgo";
  const profileUrl = `https://leetcode.com/${leetcodeId}`;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${leetcodeId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: LeetCodeStats = await response.json();
        setStats(data);
      } catch (err) {
        // Type-safe error handling
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [leetcodeId]);

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="border-4 border-gray-300 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg font-medium">Loading LeetCode stats...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="border-4 border-red-400 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <Trophy className="w-12 h-12 mx-auto opacity-50" />
              </div>
              <p className="text-lg font-medium text-red-700">Failed to load stats</p>
              <p className="text-sm text-red-600 mt-2">Error: {error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Calculate progress percentages
  const easyProgress = (stats.easySolved / stats.totalEasy) * 100;
  const mediumProgress = (stats.mediumSolved / stats.totalMedium) * 100;
  const hardProgress = (stats.hardSolved / stats.totalHard) * 100;
  const overallProgress = (stats.totalSolved / stats.totalQuestions) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="relative border-4 border-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
        {/* Gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 rounded-2xl blur opacity-20 -z-10"></div>
        
        {/* Top corner LeetCode ID */}
        <div className="absolute top-4 right-4">
          <a 
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1 rounded-full border-2 border-orange-400 hover:border-orange-300 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <span className="text-sm font-mono font-bold">@{leetcodeId}</span>
          </a>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 mt-8">
          <div className="p-2 rounded-lg border-2 border-yellow-400">
            <Trophy className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">LeetCode Progress</h2>
            <p className="text-sm opacity-70">solving in java</p>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Overall Progress */}
          <div className="border-2 border-indigo-400 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold">Overall Progress</span>
              </div>
              <span className="text-2xl font-bold">{stats.totalSolved}</span>
            </div>
            <div className="h-3 border border-gray-300 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-1000"
                style={{ width: `${Math.max(overallProgress, 0.5)}%` }}
              ></div>
            </div>
            <p className="text-xs opacity-70">{stats.totalSolved} / {stats.totalQuestions?.toLocaleString()} solved</p>
          </div>

          {/* Acceptance Rate */}
          <div className="border-2 border-green-400 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-semibold">Acceptance Rate</span>
              </div>
              <span className="text-2xl font-bold">{stats.acceptanceRate}%</span>
            </div>
            <div className="h-3 border border-gray-300 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-emerald-600 transition-all duration-1000"
                style={{ width: `${stats.acceptanceRate}%` }}
              ></div>
            </div>
            <p className="text-xs opacity-70">
              {stats.acceptanceRate === 100 ? 'Perfect success rate!' : 'Keep improving!'}
            </p>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="border-2 border-pink-400 rounded-xl p-4 mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-pink-600" />
            Problem Difficulty Breakdown
          </h3>
          
          <div className="space-y-4">
            {/* Easy */}
            <div className="flex items-center gap-4">
              <div className="w-16 text-sm font-medium">Easy</div>
              <div className="flex-1 h-2 border border-gray-300 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-1000"
                  style={{ width: `${Math.max(easyProgress, 0.5)}%` }}
                ></div>
              </div>
              <div className="text-sm font-mono w-20 text-right">
                {stats.easySolved}/{stats.totalEasy}
              </div>
            </div>

            {/* Medium */}
            <div className="flex items-center gap-4">
              <div className="w-16 text-sm font-medium">Medium</div>
              <div className="flex-1 h-2 border border-gray-300 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-600 transition-all duration-1000"
                  style={{ width: `${Math.max(mediumProgress, 0.5)}%` }}
                ></div>
              </div>
              <div className="text-sm font-mono w-20 text-right">
                {stats.mediumSolved}/{stats.totalMedium}
              </div>
            </div>

            {/* Hard */}
            <div className="flex items-center gap-4">
              <div className="w-16 text-sm font-medium">Hard</div>
              <div className="flex-1 h-2 border border-gray-300 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-400 to-red-600 transition-all duration-1000"
                  style={{ width: `${Math.max(hardProgress, 0.5)}%` }}
                ></div>
              </div>
              <div className="text-sm font-mono w-20 text-right">
                {stats.hardSolved}/{stats.totalHard}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border-2 border-blue-400 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <Trophy className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-lg font-bold">{stats.ranking?.toLocaleString() || 'N/A'}</div>
            <div className="text-xs opacity-70">Ranking</div>
          </div>

          <div className="border-2 border-purple-400 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <Star className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-lg font-bold">{stats.contributionPoints || 0}</div>
            <div className="text-xs opacity-70">Points</div>
          </div>

          <div className="border-2 border-cyan-400 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <Award className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-lg font-bold">{stats.reputation || 0}</div>
            <div className="text-xs opacity-70">Reputation</div>
          </div>

          <div className="border-2 border-rose-400 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-lg font-bold">
              {stats.submissionCalendar ? Object.keys(stats.submissionCalendar).length : 0}
            </div>
            <div className="text-xs opacity-70">Active Days</div>
          </div>
        </div>

        {/* Motivational Footer */}
        <div className="mt-6 text-center p-3 border-2 border-gradient-to-r from-violet-400 to-pink-400 rounded-lg">
          <p className="text-sm font-medium">They don't know me son !!!!!!!</p>
        </div>
      </div>
    </div>
  );
}