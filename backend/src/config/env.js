import dotenv from "dotenv"
dotenv.config()

const config = Object.freeze({
  port        : process.env.PORT || 5000,
  mongoUri    : process.env.MONGODB_URI,
  jwtSecret   : process.env.JWT_SECRET,
  groqApiKey  : process.env.GROQ_API_KEY,
  frontendUrl : process.env.FRONTEND_URL || "http://localhost:5173"
})
export default config
