import { Router } from "express"
import authMiddleware from "../middleware/auth.middleware.js"
import { validateChatMessage } from "../middleware/validate.middleware.js"
import { chat, getSessions, getSessionById, deleteSession } from "../controllers/chatbot.controller.js"

const router = Router()

router.post("/chat", authMiddleware, validateChatMessage, chat)
router.get("/sessions", authMiddleware, getSessions)
router.get("/sessions/:sessionId", authMiddleware, getSessionById)
router.delete("/sessions/:sessionId", authMiddleware, deleteSession)

export default router
