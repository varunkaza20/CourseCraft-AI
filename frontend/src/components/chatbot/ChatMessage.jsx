import React from 'react';
import { AlertCircle, XCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ChatMessage({ message, loading }) {
  if (loading) {
    return (
      <div className="flex w-full justify-start mb-4">
        <div className="flex items-end gap-2 max-w-[75%]">
          <div className="w-7 h-7 rounded-full bg-[#EEEDFE] text-purple-700 flex items-center justify-center text-xs font-medium flex-shrink-0 mb-1">
            AI
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-2.5">
            <div className="flex gap-1 items-center px-2 py-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isUser = message.role === 'user';
  
  if (isUser) {
    return (
      <div className="flex w-full justify-end mb-4">
        <div className="flex flex-col items-end max-w-[75%]">
          <div className="bg-[#534AB7] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm whitespace-pre-wrap">
            {message.content}
          </div>
          {message.timestamp && (
            <div className="text-[10px] text-gray-400 mt-1">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (message.isOutOfContext) {
    return (
      <div className="flex w-full justify-start mb-4">
        <div className="flex items-end gap-2 max-w-[75%]">
          <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mb-1">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="flex flex-col items-start">
            <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-[#DC2626] whitespace-pre-wrap">
              <div className="flex items-center gap-1 mb-1 font-medium text-xs">
                <AlertCircle className="w-3 h-3" />
                Out of context
              </div>
              {message.content}
            </div>
            {message.timestamp && (
              <div className="text-[10px] text-gray-400 mt-1">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (message.isError) {
    return (
      <div className="flex w-full justify-start mb-4">
        <div className="flex items-end gap-2 max-w-[75%]">
          <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 mb-1">
            <XCircle className="w-4 h-4" />
          </div>
          <div className="flex flex-col items-start">
            <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-[#9A3412] whitespace-pre-wrap">
              <div className="flex items-center gap-1 mb-1 font-medium text-xs">
                <XCircle className="w-3 h-3" />
                Error
              </div>
              {message.content}
            </div>
            {message.timestamp && (
              <div className="text-[10px] text-gray-400 mt-1">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-start mb-4">
      <div className="flex items-end gap-2 max-w-[75%]">
        <div className="w-7 h-7 rounded-full bg-[#EEEDFE] text-purple-700 flex items-center justify-center text-xs font-medium flex-shrink-0 mb-1">
          AI
        </div>
        <div className="flex flex-col items-start">
          <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-gray-800">
            <div className="markdown-prose">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          </div>
          {message.timestamp && (
            <div className="text-[10px] text-gray-400 mt-1">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
