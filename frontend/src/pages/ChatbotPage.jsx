import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus } from 'lucide-react';
import ContextSelector from '../components/chatbot/ContextSelector';
import ContextPreviewCard from '../components/chatbot/ContextPreviewCard';
import ChatWindow from '../components/chatbot/ChatWindow';
import ChatHistoryList from '../components/chatbot/ChatHistoryList';
import { useChatbot } from '../hooks/useChatbot';

export default function ChatbotPage() {
  const [selectedContextType, setSelectedContextType] = useState(null);
  const [selectedContextId, setSelectedContextId] = useState(null);
  const [selectedContextData, setSelectedContextData] = useState(null);

  const chatState = useChatbot();

  // We use a ref to prevent infinite loops if fetchSessions is unstable,
  // but it's wrapped in useCallback so it should be fine.
  useEffect(() => {
    chatState.fetchSessions();
  }, [chatState.fetchSessions]);

  const handleSelectContext = (type, id, data) => {
    setSelectedContextType(type);
    setSelectedContextId(id);
    setSelectedContextData(data);
    chatState.clearChat();
  };

  const handleClearContext = () => {
    setSelectedContextType(null);
    setSelectedContextId(null);
    setSelectedContextData(null);
    chatState.clearChat();
  };

  const handleLoadSession = async (sessionId) => {
    const session = await chatState.loadSession(sessionId);
    if (session) {
      setSelectedContextType(session.contextType);
      setSelectedContextId(session.contextId);
      setSelectedContextData(null); // Clear preview card data if it's stale
    }
  };

  const handleNewChat = () => {
    chatState.clearChat();
  };

  return (
    <div className="flex h-full bg-white">
      {/* Left Panel */}
      <div className="w-80 flex-shrink-0 border-r border-gray-200 flex flex-col bg-white overflow-hidden">
        <div className="p-4 flex flex-col h-full min-h-0">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-purple-600" />
              <h2 className="text-base font-medium text-gray-900">CourseCraft Chatbot</h2>
            </div>
            <button
              onClick={handleNewChat}
              className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
              title="New Chat"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-6 flex-shrink-0">Chat with your generated content</p>

          <div className="flex-shrink-0">
            <ContextSelector
              contextType={selectedContextType}
              contextId={selectedContextId}
              onSelect={handleSelectContext}
            />
          </div>

          {selectedContextId && selectedContextData && (
            <div className="flex-shrink-0">
              <div className="my-5 border-t border-gray-100"></div>
              <ContextPreviewCard
                contextType={selectedContextType}
                contextData={selectedContextData}
                onClear={handleClearContext}
              />
            </div>
          )}

          <div className="mt-8 flex-1 flex flex-col min-h-0">
            <h3 className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2 flex-shrink-0">Past Chats</h3>
            <ChatHistoryList 
              sessions={chatState.sessions} 
              currentSessionId={chatState.currentSessionId}
              loadSession={handleLoadSession}
              deleteSession={chatState.deleteSession}
              isLoadingSessions={chatState.isLoadingSessions}
            />
          </div>

        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatWindow
          contextType={selectedContextType}
          contextId={selectedContextId}
          contextData={selectedContextData}
          chatState={chatState}
        />
      </div>
    </div>
  );
}
