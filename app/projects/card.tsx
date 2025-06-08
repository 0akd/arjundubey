"use client";
import React, { JSX } from "react";

interface CardProps {
  title: string;
  bodyText?: string;
  repoLink: string;
  updateDate: string;
  imagePath?: string;
  liveLink?: string;
}

export default function Card(props: CardProps): JSX.Element {
  let desc: JSX.Element;
  
  if (!props.bodyText) {
    desc = <p className="text-sm mb-3">No description available</p>;
  } else {
    desc = <p className="text-sm mb-3 line-clamp-3">{props.bodyText}</p>;
  }
  
  // Format the date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <div className="p-3">
      <div className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col overflow-hidden border border-gray-100">
        {/* Image Section */}
        {props.imagePath && (
          <div className="h-48 overflow-hidden flex items-center justify-center">
            <img 
              src={props.imagePath} 
              alt={props.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                // Show a placeholder instead
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center">
                      <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  `;
                }
              }}
            />
          </div>
        )}
        
        {/* Header Section */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-lg leading-tight truncate pr-2">
              {props.title}
            </h3>
            <div className="flex-shrink-0">
              <div className="w-3 h-3 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex-1">
            {desc}
          </div>
          
          <div className="text-xs mb-4 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Updated {formatDate(props.updateDate)}
          </div>
        </div>
        
        {/* Footer Section */}
        <div className="px-6 pb-6 space-y-3">
          {/* Live Link Button */}
          {props.liveLink && (
            <a 
              href={props.liveLink} 
              className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 group"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>View Live</span>
            </a>
          )}
          
          {/* GitHub Repo Button */}
          <a 
            href={props.repoLink} 
            className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 group"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
            </svg>
            <span>View Code</span>
          </a>
        </div>
      </div>
    </div>
  );
}