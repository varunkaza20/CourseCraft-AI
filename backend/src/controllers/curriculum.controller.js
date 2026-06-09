import Program from "../models/Program.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import { generateCurriculum as groqGenerateCurriculum } from "../services/groq.service.js";

export const generateCurriculum = async (req, res, next) => {
  try {
    const {
      programName, degreeType, department, specialization,
      durationYears, durationSemesters, totalCredits,
      electivePreference, careerGoals
    } = req.body;

    const user = await User.findById(req.user.userId).select("customInstructions");
    const customInstructions = user?.customInstructions || "";

    let generatedCurriculum;
    try {
      generatedCurriculum = await groqGenerateCurriculum(req.body, customInstructions);
    } catch (err) {
      return res.status(502).json({ message: "AI generation failed: " + err.message });
    }

    const newProgram = new Program({
      userId: req.user.userId,
      programName,
      degreeType,
      department,
      specialization,
      durationYears,
      durationSemesters,
      totalCredits,
      electivePreference,
      careerGoals,
      generatedCurriculum,
      status: "generated"
    });

    const savedProgram = await newProgram.save();
    res.status(201).json({ message: "Curriculum generated", program: savedProgram });
  } catch (error) {
    next(error);
  }
};

export const getMyPrograms = async (req, res, next) => {
  try {
    const programs = await Program.find({ userId: req.user.userId })
      .select('programName degreeType department specialization durationYears totalCredits status createdAt')
      .sort({ createdAt: -1 });
    res.status(200).json({ programs });
  } catch (error) {
    next(error);
  }
};

export const getProgramById = async (req, res, next) => {
  try {
    const program = await Program.findOne({ _id: req.params.programId, userId: req.user.userId });
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }
    res.status(200).json({ program });
  } catch (error) {
    next(error);
  }
};

export const deleteProgram = async (req, res, next) => {
  try {
    const result = await Program.deleteOne({ _id: req.params.programId, userId: req.user.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Program not found" });
    }
    res.status(200).json({ message: "Program deleted" });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const curriculumCount = await Program.countDocuments({ userId });
    let courseCount = 0;
    try {
      courseCount = await Course.countDocuments({ userId });
    } catch (_) { /* Course model may not have data yet */ }
    res.json({
      curriculums : curriculumCount,
      courses     : courseCount,
      outcomes    : 0,
      exports     : 0
    });
  } catch (error) {
    next(error);
  }
};
