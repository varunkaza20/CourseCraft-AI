import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Program",
    default: null
  },
  courseName: { type: String, required: true, trim: true },
  courseCode: { type: String, required: true, trim: true },
  credits: { type: Number, required: true },
  difficultyLevel: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"]
  },
  numberOfUnits: { type: Number, required: true, min: 1, max: 10 },
  courseType: {
    type: String,
    enum: ["core", "elective", "open_elective"]
  },
  includesLab: { type: Boolean, default: false },
  numberOfExperiments: { type: Number, default: 0 },
  generatedSyllabus: {
    courseDescription: String,
    prerequisites: [String],
    courseObjectives: [String],
    units: [
      {
        unitNumber: Number,
        unitTitle: String,
        topics: [String],
        estimatedHours: Number
      }
    ],
    labSyllabus: [
      {
        experimentNumber: Number,
        title: String,
        aim: String,
        estimatedHours: Number
      }
    ]
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Course", courseSchema);
