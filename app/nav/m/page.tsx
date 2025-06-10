'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';

const MainComponent: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen">
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 rounded-md border border-gray-300 hover:border-gray-400 transition-colors duration-200"
        aria-label="Toggle sidebar"
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <div className={`w-5 h-0.5 transition-all duration-300 ${isSidebarOpen ? 'rotate-45 translate-y-1.5' : 'mb-1'}`} style={{ backgroundColor: 'currentColor' }} />
          <div className={`w-5 h-0.5 transition-all duration-300 ${isSidebarOpen ? 'opacity-0' : 'mb-1'}`} style={{ backgroundColor: 'currentColor' }} />
          <div className={`w-5 h-0.5 transition-all duration-300 ${isSidebarOpen ? '-rotate-45 -translate-y-1.5' : ''}`} style={{ backgroundColor: 'currentColor' }} />
        </div>
      </button>
      
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-80' : 'ml-0'} p-8`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Main Content Area</h1>
          <div className="grid gap-6">
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Section 1</h2>
              <p>
                This is your main content area. The sidebar can be toggled using the hamburger button
                in the top-left corner. Click anywhere outside the sidebar or use the close button
                to dismiss it.
              </p>
            </div>
            
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Section 2</h2>
              <p>
                The sidebar is fully scrollable and contains multiple navigation items.
                You can customize the navigation items by modifying the navigationItems array
                in the Sidebar component.
              </p>
            </div>
            
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Features</h2>
              <ul className="space-y-2">
                <li>• Responsive sidebar with smooth animations</li>
                <li>• Click outside to close functionality</li>
                <li>• Escape key support</li>
                <li>• Scrollable navigation menu</li>
                <li>• Customizable navigation items</li>
                <li>• No hardcoded background or text colors</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainComponent;