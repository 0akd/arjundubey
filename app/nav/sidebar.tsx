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

const [openCategory, setOpenCategory] = useState<string | null>(null);






const routes = [
  // {
  //   category: 'Main',
  //   children: [
  
  //   ]
  // },
  // {
  //   category: 'Academics',
  //   children: [

  //   ]
  // },
  // {
  //   category: 'Entertainment',
  //   children: [
   
  //   ]
  // },
  {
    category: 'Me',
    children: [

          { label: 'Home', path: '/' },
      { label: 'About', path: '/about' },
            { label: 'Background', path: '/education' },
         { label: 'Music', path: '/music' },
      { label: 'Stats', path: '/reality' },
      { label: 'Donate', path: '/donate' },
    ]
  }
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
    duration: 1.5,
    ease: 'easeOut',

  }}
>
  {openCategory === null ? (
    // Show super category list
    <div className="space-y-2">
      {routes.map((group) => (
        <button
          key={group.category}
          onClick={() => setOpenCategory(group.category)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full text-left"
        >
          {group.category}
        </button>
      ))}
    </div>
  ) : (
    // Show selected category's children 
    <motion.div
  animate={{
    y: [0, '-50%', 0],
    opacity: [0, 1, 1],
  }}
  transition={{
    duration: 1.5,
    ease: 'easeOut',

  }}
>  
    <div className="space-y-2">
      <button
        onClick={() => setOpenCategory(null)}
        className="mb-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 w-full"
      >
        ← Back
      </button>
    {routes
        .find((group) => group.category === openCategory)
        ?.children.map((route) => (
          <button
            key={route.path}
            onClick={() => {
              setIsOpen(false);
              router.push(route.path);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-full"
          >
            {route.label}
          </button>
        ))}
    </div></motion.div>
  )}
</motion.div>


          </div>
        </div>
      )}
    </div></>
  );
};

export default Modal;
