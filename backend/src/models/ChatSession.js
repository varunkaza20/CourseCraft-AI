import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  isOutOfContext: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

const chatSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contextType: { type: String, enum: ["curriculum", "course", "program"], required: true },
    contextId: { type: mongoose.Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    messages: [messageSchema]
  },
  { timestamps: true }
);

const ChatSession = mongoose.model("ChatSession", chatSessionSchema);

export default ChatSession;
