import Course from "../models/Course.js";
import User from "../models/User.js";
import { generateCourseSyllabus } from "../services/groq.service.js";

export const generateCourse = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select("customInstructions");
    const customInstructions = user?.customInstructions || "";

    let generatedSyllabus;
    try {
      generatedSyllabus = await generateCourseSyllabus(req.body, customInstructions);
    } catch (err) {
      return res.status(502).json({ message: "AI generation failed: " + err.message });
    }

    const course = new Course({
      userId: req.user.userId,
      programId: req.body.programId || null,
      courseName: req.body.courseName,
      courseCode: req.body.courseCode,
      credits: req.body.credits,
      difficultyLevel: req.body.difficultyLevel,
      numberOfUnits: req.body.numberOfUnits,
      courseType: req.body.courseType,
      includesLab: req.body.includesLab || false,
      numberOfExperiments: req.body.numberOfExperiments || 0,
      generatedSyllabus
    });

    const savedCourse = await course.save();
    res.status(201).json({ message: "Course generated", course: savedCourse });
  } catch (error) {
    next(error);
  }
};

export const getMyCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ userId: req.user.userId })
      .select("courseName courseCode credits difficultyLevel courseType includesLab createdAt")
      .sort({ createdAt: -1 });
    res.status(200).json({ courses });
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.courseId, userId: req.user.userId });
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.status(200).json({ course });
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const result = await Course.deleteOne({ _id: req.params.courseId, userId: req.user.userId });
    if (result.deletedCount === 0) return res.status(404).json({ message: "Course not found" });
    res.status(200).json({ message: "Course deleted" });
  } catch (error) {
    next(error);
  }
};
