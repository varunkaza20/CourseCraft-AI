import express from "express";
import { generateCourse, getMyCourses, getCourseById, deleteCourse } from "../controllers/course.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { validateCourseGenerate } from "../middleware/validate.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/generate", validateCourseGenerate, generateCourse);
router.get("/my-courses", getMyCourses);
router.get("/:courseId", getCourseById);
router.delete("/:courseId", deleteCourse);

export default router;
