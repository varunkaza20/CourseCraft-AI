import OutcomeMapping from "../models/OutcomeMapping.js";
import User from "../models/User.js";
import { generateCourseOutcomes, generateCOPOMatrix } from "../services/groq.service.js";

export const generateCOs = async (req, res, next) => {
  try {
    const { syllabusText } = req.body;
    const user = await User.findById(req.user.userId).select("customInstructions");
    const customInstructions = user?.customInstructions || "";
    
    const result = await generateCourseOutcomes(syllabusText, customInstructions);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const generateMatrix = async (req, res, next) => {
  try {
    const { courseOutcomes, programOutcomes } = req.body;
    const user = await User.findById(req.user.userId).select("customInstructions");
    const customInstructions = user?.customInstructions || "";

    const result = await generateCOPOMatrix(courseOutcomes, programOutcomes, customInstructions);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const saveMapping = async (req, res, next) => {
  try {
    const {
      programId,
      courseId,
      sourceType,
      courseName,
      courseCode,
      syllabusText,
      programOutcomes,
      generatedOutcomes,
    } = req.body;

    const mapping = await OutcomeMapping.create({
      userId: req.user.userId,
      programId: programId || null,
      courseId: courseId || null,
      sourceType,
      courseName,
      courseCode,
      syllabusText,
      programOutcomes,
      generatedOutcomes,
    });

    res.status(201).json({
      message: "Outcome mapping saved successfully",
      mapping,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyMappings = async (req, res, next) => {
  try {
    const mappings = await OutcomeMapping.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .select("-syllabusText"); // Exclude large text for list view

    res.status(200).json({ mappings });
  } catch (error) {
    next(error);
  }
};

export const getMappingById = async (req, res, next) => {
  try {
    const mapping = await OutcomeMapping.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!mapping) {
      return res.status(404).json({ message: "Mapping not found" });
    }

    res.status(200).json({ mapping });
  } catch (error) {
    next(error);
  }
};

export const deleteMapping = async (req, res, next) => {
  try {
    const result = await OutcomeMapping.deleteOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Mapping not found" });
    }

    res.status(200).json({ message: "Mapping deleted successfully" });
  } catch (error) {
    next(error);
  }
};
