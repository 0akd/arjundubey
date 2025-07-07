'use client';

import { useEffect, useRef, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/firebase';
import DefaultComponent from './display/page';
import AdminComponent from './organise/page';

const ADMIN_EMAILS = ['reboostify@gmail.com', 'unidimensia@gmail.com'];

const DualViewComponent = () => {
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedView, setSelectedView] = useState<'default' | 'admin'>('default');

  const editorRef = useRef<HTMLDivElement>(null);

  const isAdmin = ADMIN_EMAILS.includes(currentUserEmail);

  // Firebase auth listener
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        setCurrentUserEmail(user.email);
        console.log('User authenticated:', user.email);
      } else {
        setCurrentUserEmail('');
        console.log('User not authenticated');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Show modal if admin
  useEffect(() => {
    if (!authLoading && isAdmin) {
      setShowModal(true);
    }
  }, [authLoading, isAdmin]);

  // Optional: Set editor content
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerText = 'Some initial content'; // replace with your `content`
    }
  }, []);

  if (authLoading) return <div>Loading...</div>;

  return (
    <div>
      {selectedView === 'default' ? <DefaultComponent /> : <AdminComponent />}

      {/* Modal for admin only */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Select View</h2>
            <div className="flex justify-between">
              <button
                className="w-1/2 mr-2 p-3 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => {
                  setSelectedView('default');
                  setShowModal(false);
                }}
              >
                Default View
              </button>
              <button
                className="w-1/2 ml-2 p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => {
                  setSelectedView('admin');
                  setShowModal(false);
                }}
              >
                Admin View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DualViewComponent;
