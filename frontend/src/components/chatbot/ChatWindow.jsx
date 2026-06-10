import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Sparkles, Trash2 } from 'lucide-react';
import { useChatbot } from '../../hooks/useChatbot';
import ChatMessage from './ChatMessage';

export default function ChatWindow({ contextType, contextId, contextData, chatState }) {
  const { messages, isLoading, sendMessage, clearChat } = chatState;
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [contextId]);

  useEffect(() => {
    clearChat();
    setInputValue('');
  }, [contextId]); // reset chat when context changes

  const handleSend = async () => {
    if (!inputValue.trim() || !contextId || isLoading) return;
    const msg = inputValue;
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'; // reset height
    }
    await sendMessage({ contextType, contextId, userMessage: msg });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`; // max ~4 rows
  };

  const suggestions = {
    curriculum: [
      "What courses are in semester 1?",
      "List all elective courses",
      "What are the program outcomes?",
      "Which course has the most credits?"
    ],
    course: [
      "What are the course objectives?",
      "List all unit topics",
      "What are the prerequisites?",
      "How many lab experiments are there?"
    ],
    program: [
      "What happens in week 1?",
      "What are the learning outcomes?",
      "Describe the capstone project",
      "What tools are recommended?"
    ]
  };

  const currentSuggestions = contextType ? suggestions[contextType] : [];

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      <div className="flex-1 overflow-y-auto px-4 py-4 relative">
        {messages.length > 0 && (
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear chat
            </button>
          </div>
        )}

        {!contextId ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <MessageCircle className="w-16 h-16 text-purple-200 opacity-40 mb-4" />
            <h3 className="text-sm font-medium text-gray-700 mb-1">Select a context to start chatting</h3>
            <p className="text-xs text-gray-500 max-w-xs">
              Choose a curriculum, course, or program from the panel on the left.
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-lg mx-auto">
            <Sparkles className="w-12 h-12 text-purple-400 opacity-40 mb-4" />
            <h3 className="text-sm text-gray-600 mb-6">
              Ask me anything about <span className="text-purple-600 font-medium">{contextData?.programName || contextData?.courseName}</span>
            </h3>
            
            <div className="flex flex-wrap justify-center gap-2">
              {currentSuggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => {
                    sendMessage({ contextType, contextId, userMessage: suggestion });
                  }}
                  className="px-3 py-1.5 text-xs text-purple-600 bg-purple-50 border border-purple-200 rounded-full hover:bg-purple-100 transition-colors cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full pt-8">
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && <ChatMessage loading />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-end mb-1">
            <span className="text-[10px] text-gray-400">{inputValue.length}/500</span>
          </div>
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={inputValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              disabled={!contextId || isLoading}
              maxLength={500}
              placeholder={contextId ? `Ask about this ${contextType}...` : "Select a context first..."}
              className="flex-1 resize-none rounded-xl border border-gray-300 text-sm px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:bg-gray-50 min-h-[44px] max-h-[96px] overflow-y-auto leading-relaxed"
            />
            <button
              onClick={handleSend}
              disabled={!contextId || !inputValue.trim() || isLoading}
              className={`w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl transition-colors ${
                !contextId || !inputValue.trim() || isLoading
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
              }`}
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
