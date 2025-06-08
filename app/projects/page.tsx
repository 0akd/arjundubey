"use client";
import Projects from "./project";
import { useEffect, useState } from "react";

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  updated_at: string;
  fork: boolean;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback data for development/rate limiting
  const fallbackProjects: GitHubRepo[] = [
    {
      id: 1,
      name: "sample-project-1",
      description: "A sample project for demonstration",
      html_url: "https://github.com/arjundubeyg/sample-project-1",
      updated_at: "2024-01-15T10:30:00Z",
      fork: false
    },
    {
      id: 2,
      name: "sample-project-2", 
      description: "Another sample project",
      html_url: "https://github.com/arjundubeyg/sample-project-2",
      updated_at: "2024-01-10T15:45:00Z",
      fork: false
    }
  ];

  useEffect(() => {
    console.log('ProjectsPage mounted, fetching projects...');
    
    async function fetchProjects() {
      try {
        console.log('Making API request to GitHub...');
        const response = await fetch('https://api.github.com/users/arjundubeyg/repos', {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Portfolio-Website',
            // Add your GitHub token here (create one at https://github.com/settings/tokens)
            'Authorization': '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' ? `token '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'` : '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'
          }
        });

        console.log('Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched repos:', data.length);
          setProjects(data);
          setError(null);
          // Cache the data in localStorage for future visits
          localStorage.setItem('github-repos', JSON.stringify(data));
          localStorage.setItem('github-repos-timestamp', Date.now().toString());
        } else {
          const errorData = await response.json();
          console.error('Failed to fetch repos:', response.status, errorData);
          
          // If rate limited, try to use cached data
          if (response.status === 403 && errorData.message?.includes('rate limit')) {
            const cachedData = localStorage.getItem('github-repos');
            const cachedTimestamp = localStorage.getItem('github-repos-timestamp');
            
            if (cachedData && cachedTimestamp) {
              const data = JSON.parse(cachedData);
              const age = Date.now() - parseInt(cachedTimestamp);
              const ageHours = age / (1000 * 60 * 60);
              
              console.log('Using cached data (age:', ageHours.toFixed(1), 'hours)');
              setProjects(data);
              setError(`Using cached data due to rate limit. Data is ${ageHours.toFixed(1)} hours old.`);
            } else {
              setError('GitHub API rate limit exceeded. Using fallback data.');
              setProjects(fallbackProjects);
            }
          } else {
            setError(`Failed to fetch repositories: ${response.status}`);
            setProjects([]);
          }
        }
      } catch (error) {
        console.error('Error fetching repos:', error);
        
        // Try cached data on network error too
        const cachedData = localStorage.getItem('github-repos');
        if (cachedData) {
          const data = JSON.parse(cachedData);
          setProjects(data);
          setError(`Using cached data due to network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } else {
          setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setProjects([]);
        }
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    }

    // Check if we have recent cached data first
    const cachedData = localStorage.getItem('github-repos');
    const cachedTimestamp = localStorage.getItem('github-repos-timestamp');
    
    if (cachedData && cachedTimestamp) {
      const age = Date.now() - parseInt(cachedTimestamp);
      const ageMinutes = age / (1000 * 60);
      
      // Use cached data if it's less than 30 minutes old
      if (ageMinutes < 30) {
        console.log('Using recent cached data');
        setProjects(JSON.parse(cachedData));
        setLoading(false);
        return;
      }
    }

    fetchProjects();
  }, []);

  console.log('Render - Loading:', loading, 'Projects:', projects.length, 'Error:', error);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Projects</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Projects data={projects} />
    </div>
  );
}