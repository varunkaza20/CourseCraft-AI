import Program from "../models/Program.js"
import Course from "../models/Course.js"
import GeneratedProgram from "../models/GeneratedProgram.js"
import User from "../models/User.js"
import ChatSession from "../models/ChatSession.js"
import { chatWithContext } from "../services/groq.service.js"

export const chat = async (req, res, next) => {
  try {
    const {
      contextType,
      contextId,
      userMessage,
      conversationHistory,
      sessionId
    } = req.body

    const userId = req.user.userId

    let contextData = null
    let title = "Chat"

    if (contextType === "curriculum") {
      contextData = await Program.findOne({ _id: contextId, userId })
      if (!contextData) return res.status(404).json({ message: "Curriculum not found" })
      title = `Curriculum: ${contextData.programName}`
    }
    else if (contextType === "course") {
      contextData = await Course.findOne({ _id: contextId, userId })
      if (!contextData) return res.status(404).json({ message: "Course not found" })
      title = `Course: ${contextData.courseName}`
    }
    else if (contextType === "program") {
      contextData = await GeneratedProgram.findOne({ _id: contextId, userId })
      if (!contextData) return res.status(404).json({ message: "Program not found" })
      title = `Program: ${contextData.programName}`
    }

    const user = await User.findById(userId).select("customInstructions")

    const result = await chatWithContext({
      contextType,
      contextData       : contextData.toObject(),
      conversationHistory: conversationHistory || [],
      userMessage,
      customInstructions: user.customInstructions || ""
    })

    // Session Management
    let session;
    if (sessionId) {
      session = await ChatSession.findOne({ _id: sessionId, userId });
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      // Add user message
      session.messages.push({ role: "user", content: userMessage });
    } else {
      // Create new session
      session = new ChatSession({
        userId,
        contextType,
        contextId,
        title,
        messages: [{ role: "user", content: userMessage }]
      });
    }

    // Add AI message
    session.messages.push({
      role: "assistant",
      content: result.message,
      isOutOfContext: result.isOutOfContext,
      isError: false
    });

    await session.save();

    res.json({
      message: result.message,
      isOutOfContext: result.isOutOfContext,
      sessionId: session._id
    })

  } catch (err) { next(err) }
}

export const getSessions = async (req, res, next) => {
  try {
    const sessions = await ChatSession.find({ userId: req.user.userId })
      .select('contextType contextId title createdAt updatedAt')
      .sort({ updatedAt: -1 });
    res.json({ sessions });
  } catch (err) { next(err); }
};

export const getSessionById = async (req, res, next) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.sessionId, userId: req.user.userId });
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json({ session });
  } catch (err) { next(err); }
};

export const deleteSession = async (req, res, next) => {
  try {
    const session = await ChatSession.findOneAndDelete({ _id: req.params.sessionId, userId: req.user.userId });
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json({ message: "Session deleted successfully" });
  } catch (err) { next(err); }
};
