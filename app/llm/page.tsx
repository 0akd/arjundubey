"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';

const AWANLLM_API_KEY = "0fb30cc8-f5d7-407b-ab38-279a8be29658"; // Replace with your actual API key

const premadeMessages = [
  "Hello! I'm your AI assistant. How can I help you today?",
  "Welcome! I'm here to answer your questions and assist you.",
  "Hi there! What would you like to know or discuss?",
  "Greetings! I'm ready to help you with anything you need."
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
}

const PopupChatAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Refs - only created when needed
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const streamingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Memoized scroll function to prevent unnecessary re-renders
  const scrollToBottom = useCallback(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen]);

  // Only scroll when chat is open and messages change
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, scrollToBottom]);

  // Only initialize and run effects when chat is open
  useEffect(() => {
    if (!isOpen) return; // Do nothing when closed
    
    if (!isInitialized) {
      setIsInitialized(true);
      const randomMessage = premadeMessages[Math.floor(Math.random() * premadeMessages.length)];
      streamText(randomMessage, true);
    }
  }, [isOpen, isInitialized]);

  // Cleanup function for streaming
  const cleanupStreaming = useCallback(() => {
    if (streamingTimeoutRef.current) {
      clearTimeout(streamingTimeoutRef.current);
      streamingTimeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Only cleanup when component unmounts
  useEffect(() => {
    return () => {
      cleanupStreaming();
    };
  }, [cleanupStreaming]);

  // Reset everything when chat closes
  useEffect(() => {
    if (!isOpen) {
      cleanupStreaming();
      setIsLoading(false);
      setInputValue('');
      // Reset all state to initial values
      setMessages([]);
      setIsInitialized(false);
    }
  }, [isOpen, cleanupStreaming]);

  const streamText = useCallback(async (text: string, isPremade = false) => {
    if (!isOpen) return; // Don't stream if chat is closed
    
    const messageId = Date.now().toString();
    
    if (isPremade) {
      setMessages([{ id: messageId, role: 'assistant', content: '', streaming: true }]);
    } else {
      setMessages(prev => [...prev, { id: messageId, role: 'assistant', content: '', streaming: true }]);
    }

    let currentText = '';
    let index = 0;

    const typeNextChar = () => {
      if (index < text.length && isOpen) {
        currentText += text[index];
        index++;
        
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: currentText }
            : msg
        ));
        
        streamingTimeoutRef.current = setTimeout(typeNextChar, 30);
      } else if (isOpen) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, streaming: false }
            : msg
        ));
      }
    };

    typeNextChar();
  }, [isOpen]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading || !isOpen) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("https://api.awanllm.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${AWANLLM_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "Meta-Llama-3-8B-Instruct",
          "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            ...messages.filter(msg => !msg.streaming).map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {"role": "user", "content": userMessage.content}
          ],
          "repetition_penalty": 1.1,
          "temperature": 0.7,
          "top_p": 0.9,
          "top_k": 40,
          "max_tokens": 1024,
          "stream": true
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const assistantMessageId = Date.now().toString();
      
      setMessages(prev => [...prev, { 
        id: assistantMessageId, 
        role: 'assistant', 
        content: '', 
        streaming: true 
      }]);

      let accumulatedContent = '';

      while (true && isOpen) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;
          
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6);
              const parsed = JSON.parse(jsonStr);
              
              if (parsed.choices?.[0]?.delta?.content) {
                const content = parsed.choices[0].delta.content;
                accumulatedContent += content;
                
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: accumulatedContent }
                    : msg
                ));
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, streaming: false }
          : msg
      ));

    } catch (error) {
      if (error) {
        // Request was cancelled, don't show error
        return;
      }
      
      console.error('Error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [inputValue, isLoading, isOpen, messages]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      {/* Only render anything when chat is open */}
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 z-40"
            onClick={handleClose}
          />
          
          {/* Chat Popup */}
          <div className="bg-black fixed bottom-20 right-6 rounded-lg shadow-2xl border w-96 h-[500px] flex flex-col animate-in slide-in-from-bottom-5 duration-300 max-w-[calc(100vw-3rem)] z-50">
            {/* Header */}
            <div className="p-4 rounded-t-lg flex items-center justify-between border-b">
              <div className="flex items-center gap-2">
                <Bot size={20} />
                <h3 className="font-semibold">Dubey's SoulAI</h3>
              </div>
              <button
                onClick={handleClose}
                className="rounded p-1 transition-colors"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Container */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="rounded-full p-2 h-8 w-8 flex items-center justify-center flex-shrink-0">
                      <Bot size={16} />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'ml-auto'
                        : 'border shadow-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                      {message.streaming && (
                        <span className="inline-block w-2 h-4 ml-1 animate-pulse">|</span>
                      )}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <div className="rounded-full p-2 h-8 w-8 flex items-center justify-center flex-shrink-0">
                      <User size={16} />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="rounded-full p-2 h-8 w-8 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="border shadow-sm px-4 py-2 rounded-lg max-w-xs">
                    <div className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t rounded-b-lg">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="rounded-lg p-2 transition-colors disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Chat Button - only visible when closed */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleOpen}
            className="rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
            aria-label="Open chat"
          >
            <MessageCircle size={24} />
          </button>
        </div>
      )}
    </>
  );
};

export default PopupChatAI;