import React from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';

export default function ChatHistoryList({ sessions, currentSessionId, loadSession, deleteSession, isLoadingSessions }) {
  if (isLoadingSessions) {
    return <div className="text-sm text-gray-500 p-4">Loading history...</div>;
  }

  if (!sessions || sessions.length === 0) {
    return <div className="text-sm text-gray-500 p-4">No past chats yet.</div>;
  }

  return (
    <div className="flex flex-col gap-2 mt-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
      {sessions.map(session => (
        <div 
          key={session._id}
          onClick={() => loadSession(session._id)}
          className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
            currentSessionId === session._id 
              ? 'bg-purple-100 border border-purple-200' 
              : 'bg-white border border-gray-100 hover:bg-gray-50 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`p-2 rounded-lg ${currentSessionId === session._id ? 'bg-purple-200 text-purple-700' : 'bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600'}`}>
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className={`text-sm font-medium truncate ${currentSessionId === session._id ? 'text-purple-900' : 'text-gray-700'}`}>
                {session.title}
              </span>
              <span className="text-[10px] text-gray-400">
                {new Date(session.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteSession(session._id);
            }}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
            title="Delete chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
