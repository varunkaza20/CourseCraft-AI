import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { validateOutcomeGenerate, validateMatrixGenerate } from "../middleware/validate.middleware.js";
import { 
  generateCOs, 
  generateMatrix, 
  saveMapping, 
  getMyMappings, 
  getMappingById,
  deleteMapping 
} from "../controllers/outcome.controller.js";

const router = express.Router();

router.post("/generate-cos", authMiddleware, validateOutcomeGenerate, generateCOs);
router.post("/generate-matrix", authMiddleware, validateMatrixGenerate, generateMatrix);
router.post("/save", authMiddleware, saveMapping);
router.get("/my-mappings", authMiddleware, getMyMappings);
router.get("/:id", authMiddleware, getMappingById);
router.delete("/:id", authMiddleware, deleteMapping);

export default router;
