import mongoose from "mongoose";

const programSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  programName: {
    type: String,
    required: true,
    trim: true
  },
  degreeType: {
    type: String,
    required: true,
    enum: [
      "Bachelor of Technology", "Bachelor of Science",
      "Bachelor of Engineering", "Master of Technology",
      "Master of Science", "Master of Business Administration",
      "Bachelor of Commerce", "Bachelor of Arts", "Other"
    ]
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  durationYears: {
    type: Number,
    required: true
  },
  durationSemesters: {
    type: Number,
    required: true
  },
  totalCredits: {
    type: Number,
    required: true
  },
  electivePreference: {
    type: Number,
    required: true,
    enum: [30, 40, 50]
  },
  careerGoals: {
    type: String,
    trim: true,
    default: ""
  },
  generatedCurriculum: {
    programSummary: {
      totalCoreCredits: Number,
      totalElectiveCredits: Number,
      totalOpenElectiveCredits: Number
    },
    semesters: [
      {
        semesterNumber: Number,
        totalCredits: Number,
        courses: [
          {
            courseCode: String,
            courseName: String,
            credits: Number,
            type: {
              type: String,
              enum: ["core", "elective", "open_elective"]
            },
            hasLab: Boolean,
            prerequisite: String,
            difficultyLevel: {
              type: String,
              enum: ["beginner", "intermediate", "advanced"]
            }
          }
        ]
      }
    ],
    programOutcomes: [
      {
        poNumber: Number,
        statement: String
      }
    ]
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

programSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

export default mongoose.model('Program', programSchema);
