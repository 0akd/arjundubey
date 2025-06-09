"use client"
import React, { useState, useEffect, useRef } from 'react';
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
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  // Stream premade message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const randomMessage = premadeMessages[Math.floor(Math.random() * premadeMessages.length)];
      streamText(randomMessage, true);
    }
  }, [isOpen]);

  const streamText = async (text: string, isPremade = false) => {
    const messageId = Date.now().toString();
    
    if (isPremade) {
      setMessages([{ id: messageId, role: 'assistant', content: '', streaming: true }]);
    } else {
      setMessages(prev => [...prev, { id: messageId, role: 'assistant', content: '', streaming: true }]);
    }

    let currentText = '';
    for (let i = 0; i < text.length; i++) {
      currentText += text[i];
      setStreamingText(currentText);
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: currentText }
          : msg
      ));
      
      await new Promise(resolve => setTimeout(resolve, 30)); // Typing speed
    }
    
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, streaming: false }
        : msg
    ));
    setStreamingText('');
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

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
        })
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

      while (true) {
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
      console.error('Error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className="fixed bottom-6 right-6 z-50">
        {/* Chat Button */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
          >
            <MessageCircle size={24} />
          </button>
        )}

        {/* Chat Popup - Fixed positioning and overflow */}
        {isOpen && (
          <div className="bg-black  fixed bottom-20 right-6 rounded-lg shadow-2xl border border-gray-200 w-96 h-[500px] flex flex-col animate-in slide-in-from-bottom-5 duration-300 max-w-[calc(100vw-3rem)]">
          {/* Header */}
          <div className="p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <h3 className="font-semibold">Dubey's SoulAI</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded p-1 transition-colors"
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
                      <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse">|</span>
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
            
            {/* Loading indicator when waiting for API response */}
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
         <div className="flex flex-wrap items-center gap-2 p-2 sm:gap-3 sm:p-3  rounded-xl shadow-sm border ">
  <input
    type="text"
    value={inputValue}
    onChange={(e) => setInputValue(e.target.value)}
    onKeyPress={handleKeyPress}
    placeholder="Type your message..."
    className="flex-1 min-w-[60%] sm:min-w-[300px] rounded-lg border  px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out"
    disabled={isLoading}
  />
  <button
    onClick={handleSendMessage}
    disabled={!inputValue.trim() || isLoading}
    className="  p-2 rounded-lg transition-all duration-200 ease-in-out disabled:cursor-not-allowed"
  >
    {isLoading ? (
      <Loader2 size={16} className="animate-spin" />
    ) : (
      <Send size={16} />
    )}
  </button>
</div></div>

      )}
</div></>
  );
};

export default PopupChatAI;