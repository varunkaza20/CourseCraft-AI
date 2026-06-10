import GeneratedProgram from "../models/GeneratedProgram.js";
import User from "../models/User.js";
import { generateWeeklyProgram } from "../services/groq.service.js";

export const generateProgram = async (req, res, next) => {
  try {
    const { programName, difficultyLevel, numberOfWeeks, includesCapstone } = req.body;

    const user = await User.findById(req.user.userId)
                           .select("customInstructions");

    const schedule = await generateWeeklyProgram({
      programName,
      difficultyLevel,
      numberOfWeeks: Number(numberOfWeeks),
      includesCapstone: Boolean(includesCapstone),
      customInstructions: user.customInstructions || ""
    });

    const saved = await GeneratedProgram.create({
      userId: req.user.userId,
      programName,
      difficultyLevel,
      numberOfWeeks: Number(numberOfWeeks),
      includesCapstone: Boolean(includesCapstone),
      generatedSchedule: schedule,
      status: "generated"
    });

    res.status(201).json({
      message: "Program generated successfully",
      program: saved
    });
  } catch (err) { 
    next(err); 
  }
};

export const getMyPrograms = async (req, res, next) => {
  try {
    const programs = await GeneratedProgram
      .find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .select("programName difficultyLevel numberOfWeeks includesCapstone status createdAt");
    res.json({ programs });
  } catch (err) { 
    next(err); 
  }
};

export const getProgramById = async (req, res, next) => {
  try {
    const program = await GeneratedProgram.findOne({
      _id: req.params.programId,
      userId: req.user.userId
    });
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }
    res.json({ program });
  } catch (err) { 
    next(err); 
  }
};

export const deleteProgram = async (req, res, next) => {
  try {
    await GeneratedProgram.findOneAndDelete({
      _id: req.params.programId,
      userId: req.user.userId
    });
    res.json({ message: "Program deleted" });
  } catch (err) { 
    next(err); 
  }
};
