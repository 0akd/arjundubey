"use client"
import Card from "./card";
import React, { JSX, useState } from "react";

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  updated_at: string;
  fork: boolean;
}

interface ProjectsProps {
  data: GitHubRepo[];
}

export default function Projects({ data }: ProjectsProps): JSX.Element {
  const [showAll, setShowAll] = useState(false);
  
  // Array of repository names to exclude from display
  const excludedRepos = [
  // "ai-customer",
  "app",
  "arjun-reboostify",
  "business",
  "finalvidchit",
  "firstcabs",
  "hama-hehehe",
  "handdetection",
  "hehhe",
  "index",
  "missiondsacplusplus",
  "ml",
  "multivendor",
  "my",
  "myportfolio",
  "Panha",
  "Portfolio",
  "portfolioakdlevox",
  "portfoliome",
  "portfoliov2",
  "Reboostify",
  "reboostifyv2",
  "rvhieriger",
  "server-vid-chat",
  "speakease",
  "speakleasefinal",
  "texttoani",
  "todo",
  "underdogs"
];
  
  // Handle undefined data
  const safeData = data || [];
  
  // Filter out forks AND excluded repositories
  const filteredRepos = safeData.filter((repo) => 
    !repo.fork && !excludedRepos.includes(repo.name)
  );
  
  // Limit to 6 cards initially
  const displayedRepos = showAll ? filteredRepos : filteredRepos.slice(0, 3);
  
  // Project configuration array for images and live links
  const projectConfig: { [key: string]: { imagePath?: string; liveLink?: string } } = {
    "ai-customwer": {
      imagePath: "/images/arjun.png",
      liveLink: "https://yourname.dev"
    },
  
    // Add more project configurations as needed
  };
  
  const projectCards = displayedRepos.map((repo) => {
    const config = projectConfig[repo.name] || {};
    return (
      <Card
        key={repo.html_url}
        title={repo.name}
        bodyText={repo.description || undefined}
        repoLink={repo.html_url}
        updateDate={repo.updated_at}
        imagePath={config.imagePath}
        liveLink={config.liveLink}
      />
    );
  });

  return (
    <section className="py-16 min-h-screen" id="projects">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            My Projects
          </h2>
          <div className="w-24 h-1 mx-auto rounded-full mb-6"></div>
         
          <div className="mt-6 inline-flex items-center space-x-2 text-sm">
            <span className="inline-block w-2 h-2 rounded-full animate-pulse"></span>
            <span>{filteredRepos.length} active projects</span>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredRepos.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projectCards}
            </div>
            
            {/* View More Button */}
            {filteredRepos.length > 6 && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="px-8 py-3 border border-current rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  {showAll ? 'View Less' : 'View More'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">No Projects Found</h3>
            <p className="">Check back later for exciting new projects!</p>
          </div>
        )}
        
        {/* Fun Stats Section */}
       {filteredRepos.length > 0 && (
  <div className="mt-16 grid grid-cols-3 gap-6">
    <div className="rounded-xl p-6 text-center shadow-lg">
      <div className="text-3xl font-bold mb-2">{filteredRepos.length}</div>
      <div>Total Projects</div>
    </div>
    <div className="rounded-xl p-6 text-center shadow-lg">
      <div className="text-3xl font-bold mb-2">
        {filteredRepos.filter(repo => repo.description).length}
      </div>
      <div>Documented</div>
    </div>
    <div className="rounded-xl p-6 text-center shadow-lg">
      <div className="text-3xl font-bold mb-2">
        {new Date().getFullYear() - Math.min(...filteredRepos.map(repo => new Date(repo.updated_at).getFullYear()))}+
      </div>
      <div>Years Active</div>
    </div>
  </div>
)}
      </div>
    </section>
  );
}