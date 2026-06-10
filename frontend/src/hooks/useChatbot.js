import { useState, useCallback } from "react"
import axiosInstance from "../utils/axiosInstance"

export function useChatbot() {

  const [messages, setMessages]   = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState(null)

  const [sessions, setSessions] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)

  const fetchSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    try {
      const res = await axiosInstance.get("/api/chatbot/sessions");
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  const loadSession = async (sessionId) => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(`/api/chatbot/sessions/${sessionId}`);
      const session = res.data.session;
      setMessages(session.messages || []);
      setCurrentSessionId(sessionId);
      return session;
    } catch (err) {
      console.error("Failed to load session", err);
      setError("Failed to load chat history.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await axiosInstance.delete(`/api/chatbot/sessions/${sessionId}`);
      if (currentSessionId === sessionId) {
        clearChat();
      }
      fetchSessions();
    } catch (err) {
      console.error("Failed to delete session", err);
    }
  };

  const sendMessage = async ({
    contextType,
    contextId,
    userMessage
  }) => {
    if (!userMessage.trim()) return

    // Add user message to UI immediately
    const userMsg = {
      id           : Date.now(),
      role         : "user",
      content      : userMessage.trim(),
      isOutOfContext: false,
      timestamp    : new Date()
    }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)
    setError(null)

    try {
      const history = messages.map(m => ({
        role   : m.role,
        content: m.content
      }))

      const payload = {
        contextType,
        contextId,
        userMessage    : userMessage.trim(),
        conversationHistory: history
      };

      if (currentSessionId) {
        payload.sessionId = currentSessionId;
      }

      const res = await axiosInstance.post("/api/chatbot/chat", payload)

      const assistantMsg = {
        id           : Date.now() + 1,
        role         : "assistant",
        content      : res.data.message,
        isOutOfContext: res.data.isOutOfContext,
        timestamp    : new Date()
      }
      setMessages(prev => [...prev, assistantMsg])

      if (res.data.sessionId && !currentSessionId) {
        setCurrentSessionId(res.data.sessionId);
        fetchSessions(); // Refresh list to show the new session
      }

    } catch (err) {
      const errorMsg = {
        id           : Date.now() + 1,
        role         : "assistant",
        content      : err.response?.data?.message
                       || "Something went wrong. Please try again.",
        isOutOfContext: false,
        isError      : true,
        timestamp    : new Date()
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    setCurrentSessionId(null)
    setError(null)
  }

  return {
    messages,
    isLoading,
    error,
    sessions,
    currentSessionId,
    isLoadingSessions,
    fetchSessions,
    loadSession,
    deleteSession,
    sendMessage,
    clearChat
  }
}

