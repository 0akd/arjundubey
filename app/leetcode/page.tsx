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
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
              <p className="text-lg font-medium">Loading LeetCode stats...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <Trophy className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-lg font-medium">Failed to load stats</p>
              <p className="text-sm mt-2">Error: {error}</p>
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
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="relative rounded-2xl p-4 lg:p-6 shadow-2xl border border-purple-500/30">
        
        {/* Header - More compact */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold">LeetCode Progress</h2>
              <p className="text-sm text-cyan-400 font-medium">solving in java</p>
            </div>
          </div>
          <a 
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <span className="text-sm font-mono font-bold text-white">@{leetcodeId}</span>
          </a>
        </div>

        {/* Main Stats Grid - More columns on all screen sizes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4">
          {/* Overall Progress */}
          <div className="col-span-2 lg:col-span-1 rounded-xl p-4 border border-indigo-400/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-300" />
                <span className="font-semibold text-sm">Overall</span>
              </div>
              <span className="text-xl font-bold">{stats.totalSolved}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden mb-2 border border-slate-600">
              <div 
                className="h-full transition-all duration-1000"
                style={{ width: `${Math.max(overallProgress, 0.5)}%` }}
              ></div>
            </div>
            <p className="text-xs">{stats.totalSolved} / {stats.totalQuestions?.toLocaleString()}</p>
          </div>

          {/* Acceptance Rate */}
          <div className="col-span-2 lg:col-span-1 rounded-xl p-4 border border-green-400/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-lime-300" />
                <span className="font-semibold text-sm">Rate</span>
              </div>
              <span className="text-xl font-bold">{stats.acceptanceRate}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden mb-2 border border-slate-600">
              <div 
                className="h-full transition-all duration-1000"
                style={{ width: `${stats.acceptanceRate}%` }}
              ></div>
            </div>
            <p className="text-xs">
              {stats.acceptanceRate === 100 ? 'Perfect!' : 'Keep going!'}
            </p>
          </div>

          {/* Ranking */}
          <div className="rounded-xl p-4 border border-blue-400/50">
            <div className="flex items-center justify-center mb-1">
              <Trophy className="w-5 h-5 text-yellow-300" />
            </div>
            <div className="text-lg font-bold text-center">{stats.ranking?.toLocaleString() || 'N/A'}</div>
            <div className="text-xs text-center">Ranking</div>
          </div>

          {/* Points */}
          <div className="rounded-xl p-4 border border-purple-400/50">
            <div className="flex items-center justify-center mb-1">
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-lg font-bold text-center">{stats.contributionPoints || 0}</div>
            <div className="text-xs text-center">Points</div>
          </div>
        </div>

        {/* Difficulty Breakdown - More compact */}
        <div className="rounded-xl p-4 mb-4 border border-slate-600/50">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-pink-400" />
            Difficulty Breakdown
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Easy */}
            <div className="flex items-center gap-3">
              <div className="w-12 text-sm font-medium text-green-400">Easy</div>
              <div className="flex-1 h-2 rounded-full overflow-hidden border border-slate-600">
                <div 
                  className="h-full transition-all duration-1000"
                  style={{ width: `${Math.max(easyProgress, 0.5)}%` }}
                ></div>
              </div>
              <div className="text-sm font-mono text-green-300 w-16 text-right">
                {stats.easySolved}/{stats.totalEasy}
              </div>
            </div>

            {/* Medium */}
            <div className="flex items-center gap-3">
              <div className="w-12 text-sm font-medium text-yellow-400">Med</div>
              <div className="flex-1 h-2 rounded-full overflow-hidden border border-slate-600">
                <div 
                  className="h-full transition-all duration-1000"
                  style={{ width: `${Math.max(mediumProgress, 0.5)}%` }}
                ></div>
              </div>
              <div className="text-sm font-mono text-yellow-300 w-16 text-right">
                {stats.mediumSolved}/{stats.totalMedium}
              </div>
            </div>

            {/* Hard */}
            <div className="flex items-center gap-3">
              <div className="w-12 text-sm font-medium text-red-400">Hard</div>
              <div className="flex-1 h-2 rounded-full overflow-hidden border border-slate-600">
                <div 
                  className="h-full transition-all duration-1000"
                  style={{ width: `${Math.max(hardProgress, 0.5)}%` }}
                ></div>
              </div>
              <div className="text-sm font-mono text-red-300 w-16 text-right">
                {stats.hardSolved}/{stats.totalHard}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats - More columns */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-lg p-3 text-center border border-cyan-400/50">
            <div className="flex items-center justify-center mb-1">
              <Award className="w-4 h-4 text-cyan-300" />
            </div>
            <div className="text-base font-bold">{stats.reputation || 0}</div>
            <div className="text-xs">Reputation</div>
          </div>

          <div className="rounded-lg p-3 text-center border border-rose-400/50">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="w-4 h-4 text-rose-300" />
            </div>
            <div className="text-base font-bold">
              {stats.submissionCalendar ? Object.keys(stats.submissionCalendar).length : 0}
            </div>
            <div className="text-xs">Active Days</div>
          </div>
        </div>
      </div>
    </div>
  );
}