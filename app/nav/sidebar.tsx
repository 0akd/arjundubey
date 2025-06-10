import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

interface NavigationItem {
  name: string;
  path: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems: NavigationItem[] = [
  { name: 'Login', path: '/login' },
  { name: 'Profile', path: '/profile' },
  { name: 'Settings', path: '/settings' },
  { name: 'Analytics', path: '/analytics' },
  { name: 'Reports', path: '/reports' },
  { name: 'Messages', path: '/messages' },
  { name: 'Notifications', path: '/notifications' },
  { name: 'Calendar', path: '/calendar' },
  { name: 'Tasks', path: '/tasks' },
  { name: 'Projects', path: '/projects' },
  { name: 'Team', path: '/team' },
  { name: 'Documentation', path: '/docs' },
  { name: 'Support', path: '/support' },
  { name: 'Billing', path: '/billing' },
  { name: 'Integration', path: '/integration' },
  { name: 'API Keys', path: '/api-keys' },
  { name: 'Webhooks', path: '/webhooks' },
  { name: 'Logs', path: '/logs' },
  { name: 'Security', path: '/security' },
  { name: 'logout', path: '/logout' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay with backdrop blur */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-screen w-50 z-50 shadow-xl backdrop-blur-md   transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 flex-shrink-0  ">
          <h2 className="text-xl font-semibold">Teleport to anywhere you want</h2>
          <p>and scroll up to get more options</p>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:opacity-80 transition-all duration-200"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0 ">
          <nav className="p-4">
            <ul className="space-y-2">
{navigationItems.map((item, index) => (
  <li key={index}>
    <Link
      href={item.path}
      className="block px-4 py-3 rounded-md transition-all duration-200 
                 transform 
                 shadow-lg 
                 relative overflow-hidden
                 before:absolute before:inset-0 before:border-t before:border-l 
                 before:border-white/20 before:rounded-md
                 
               "
      onClick={onClose}
    >
      <span className="relative z-10">{item.name}</span>
    </Link>
  </li>
))}
            </ul>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 flex-shrink-0  ">
          <div className="text-sm opacity-60">
            Version 1.0.0
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;