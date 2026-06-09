import express from "express";
import { register, login, getMe, updateProfile } from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { validateRegister, validateLogin } from "../middleware/validate.middleware.js";

const router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", authMiddleware, getMe);
router.put("/update-profile", authMiddleware, updateProfile);

export default router;
