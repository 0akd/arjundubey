import React from 'react';

interface SidebarToggleButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

const SidebarToggleButton: React.FC<SidebarToggleButtonProps> = ({ onClick, isOpen }) => {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 right-4 z-50 p-2 rounded-md border border-gray-300 hover:border-gray-400 transition-colors duration-200"
      aria-label="Toggle sidebar"
    >
      <div className="w-6 h-6 flex flex-col justify-center items-center">
        <div className={`w-5 h-0.5 transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : 'mb-1'}`} style={{ backgroundColor: 'currentColor' }} />
        <div className={`w-5 h-0.5 transition-all duration-300 ${isOpen ? 'opacity-0' : 'mb-1'}`} style={{ backgroundColor: 'currentColor' }} />
        <div className={`w-5 h-0.5 transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`} style={{ backgroundColor: 'currentColor' }} />
      </div>
    </button>
  );
};

export default SidebarToggleButton;