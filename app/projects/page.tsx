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

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('https://api.github.com/users/arjundubeyg/repos', {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Portfolio-Website'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        } else {
          console.error('Failed to fetch repos:', response.status);
          setProjects([]);
        }
      } catch (error) {
        console.error('Error fetching repos:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <Projects data={projects} />
    </div>
  );
}
