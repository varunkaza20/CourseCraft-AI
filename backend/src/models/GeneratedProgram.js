import mongoose from "mongoose";

const generatedProgramSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  programName: {
    type: String,
    required: true,
    trim: true
  },
  difficultyLevel: {
    type: String,
    required: true,
    enum: ["beginner", "intermediate", "advanced"]
  },
  numberOfWeeks: {
    type: Number,
    required: true,
    min: 1,
    max: 50
  },
  includesCapstone: {
    type: Boolean,
    required: true,
    default: false
  },
  generatedSchedule: {
    programOverview: String,
    targetAudience: String,
    prerequisites: [String],
    learningOutcomes: [String],
    weeklySchedule: [
      {
        weekNumber: Number,
        weekTitle: String,
        theme: String,
        topics: [String],
        activities: [String],
        deliverables: [String],
        estimatedHours: Number
      }
    ],
    programSummary: {
      totalHours: Number,
      totalTopics: Number,
      totalDeliverables: Number,
      recommendedTools: [String],
      hasCapstone: Boolean
    },
    capstoneProject: {
      title: String,
      description: String,
      objectives: [String],
      deliverables: [String],
      evaluationCriteria: [String],
      suggestedWeeks: Number
    }
  },
  status: {
    type: String,
    enum: ["draft", "generated"],
    default: "draft"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

generatedProgramSchema.pre("save", function() {
  this.updatedAt = Date.now();
});

export default mongoose.model("GeneratedProgram", generatedProgramSchema);
