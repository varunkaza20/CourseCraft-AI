import express from "express";
import { generateCurriculum, getMyPrograms, getProgramById, deleteProgram } from "../controllers/curriculum.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { validateCurriculumGenerate } from "../middleware/validate.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/generate", validateCurriculumGenerate, generateCurriculum);
router.get("/my-programs", getMyPrograms);
router.get("/:programId", getProgramById);
router.delete("/:programId", deleteProgram);

export default router;
