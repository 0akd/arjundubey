"use client"
import React, { useState, useEffect, useRef } from 'react';
import supabase from '@/config/supabase';

export default function EditableTextBox() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('saved');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const editorRef = useRef(null);

  // Load content on component mount
  useEffect(() => {
    loadContent();
  }, []);

  // Auto-save when content changes
  useEffect(() => {
    if (content && !isLoading) {
      setSaveStatus('saving...');
      
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set new timeout for debounced save
      timeoutRef.current = setTimeout(() => {
        saveContent();
      }, 1000); // Save after 1 second of no typing
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, isLoading]);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('text_content')
        .select('content')
        .eq('id', 1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading content:', error);
      } else if (data) {
        setContent(data.content || '');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveContent = async () => {
    try {
      const { error } = await supabase
        .from('text_content')
        .upsert({ 
          id: 1, 
          content: content,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving content:', error);
        setSaveStatus('error');
      } else {
        setSaveStatus('saved');
      }
    } catch (error) {
      console.error('Error:', error);
      setSaveStatus('error');
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerText;
    setContent(newContent);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-medium text-gray-900">Text Editor</h1>
              <div className="flex items-center space-x-2">
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  saveStatus === 'saved' 
                    ? 'bg-green-100 text-green-800' 
                    : saveStatus === 'saving...'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {saveStatus}
                </div>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="p-6">
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning={true}
              onInput={handleInput}
              onPaste={handlePaste}
              className="min-h-96 w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 leading-relaxed"
              style={{ 
                minHeight: '400px',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word'
              }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Content is automatically saved as you type. You can paste, type, and delete text freely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}