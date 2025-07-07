"use client"
import React, { useEffect, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion'

const Modal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);
const router = useRouter();








const routes = [
    { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
{ label: 'Background', path: '/education' },
  { label: 'Music', path: '/music' },
  { label: 'Donate', path: '/donate' },
  // Add more routes here as needed
];











  return (<>      {/* Open Modal Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded hover:bg-gray-100"
        aria-label="Open Modal"
      >
        <Menu className="w-6 h-6" />
      </button>
    <div className="relative">


      {/* Modal Overlay */}
      {isOpen && (
<div className="fixed inset-0 h-screen w-screen bg-black/40 flex items-center justify-center z-50">
          {/* Modal Content */}
          <div
            ref={modalRef}
            className=" overflow-auto h-[50%] border-t-4 border-b-4 border-1  p-6 rounded-xl shadow-lg w-[50%] "
          >
         <motion.div
  animate={{
    y: [0, '-50%', 0],
    opacity: [0, 1, 1],
  }}
  transition={{
    duration: 3,
    ease: 'easeOut',

  }}
>
     
 {routes.map((route) => (
  <button
    key={route.path}
    onClick={() => {
      setIsOpen(false);
      router.push(route.path);
    }}
    className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-full"
  >
    {route.label}
  </button>
))}</motion.div>

          </div>
        </div>
      )}
    </div></>
  );
};

export default Modal;
