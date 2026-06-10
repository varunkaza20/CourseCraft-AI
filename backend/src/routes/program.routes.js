import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { validateProgramGenerate } from "../middleware/validate.middleware.js";
import {
  generateProgram,
  getMyPrograms,
  getProgramById,
  deleteProgram
} from "../controllers/program.controller.js";

const router = Router();

router.post(
  "/generate",
  authMiddleware,
  validateProgramGenerate,
  generateProgram
);
router.get("/my-programs", authMiddleware, getMyPrograms);
router.get("/:programId", authMiddleware, getProgramById);
router.delete("/:programId", authMiddleware, deleteProgram);

export default router;
