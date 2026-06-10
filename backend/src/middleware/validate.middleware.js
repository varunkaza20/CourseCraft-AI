export function validateRegister(req, res, next) {
  const { name, email, password } = req.body
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields required" })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ message: "Invalid email format" })
  if (password.length < 6)
    return res.status(400).json({
      message: "Password must be at least 6 characters"
    })
  next()
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ message: "All fields required" })
  next()
}

export function validateCurriculumGenerate(req, res, next) {
  const {
    programName, degreeType, department, specialization,
    durationYears, durationSemesters, totalCredits, electivePreference
  } = req.body
  if (
    !programName || !degreeType || !department ||
    !specialization || !durationYears || !durationSemesters ||
    !totalCredits || !electivePreference
  ) return res.status(400).json({ message: "All fields required" })
  if (durationYears < 2 || durationYears > 5)
    return res.status(400).json({
      message: "Duration must be between 2 and 5 years"
    })
  if (durationSemesters !== durationYears * 2)
    return res.status(400).json({
      message: "Semesters must equal years × 2"
    })
  if (totalCredits < 120 || totalCredits > 240)
    return res.status(400).json({
      message: "Total credits must be between 120 and 240"
    })
  if (![30, 40, 50].includes(Number(electivePreference)))
    return res.status(400).json({
      message: "Elective preference must be 30, 40, or 50"
    })
  next()
}

export function validateCourseGenerate(req, res, next) {
  const {
    courseName, courseCode, credits,
    difficultyLevel, numberOfUnits, courseType, includesLab,
    numberOfExperiments
  } = req.body

  if (!courseName || !courseCode)
    return res.status(400).json({ message: "Course name and code required" })
  if (!credits || credits < 1 || credits > 6)
    return res.status(400).json({ message: "Credits must be between 1 and 6" })
  if (!["beginner", "intermediate", "advanced"].includes(difficultyLevel))
    return res.status(400).json({ message: "Invalid difficulty level" })
  if (!numberOfUnits || numberOfUnits < 1 || numberOfUnits > 10)
    return res.status(400).json({ message: "Units must be between 1 and 10" })
  if (!["core", "elective", "open_elective"].includes(courseType))
    return res.status(400).json({ message: "Invalid course type" })
  if (includesLab && (!numberOfExperiments || numberOfExperiments < 1))
    return res.status(400).json({
      message: "Number of experiments required when lab is included"
    })
  next()
}

export function validateOutcomeGenerate(req, res, next) {
  const { syllabusText } = req.body;
  if (!syllabusText || typeof syllabusText !== "string") {
    return res.status(400).json({ message: "Syllabus text is required and must be a string." });
  }
  next();
}

export function validateMatrixGenerate(req, res, next) {
  const { courseOutcomes, programOutcomes } = req.body;
  if (!courseOutcomes || !Array.isArray(courseOutcomes) || courseOutcomes.length === 0) {
    return res.status(400).json({ message: "Valid courseOutcomes array is required." });
  }
  if (!programOutcomes || !Array.isArray(programOutcomes) || programOutcomes.length === 0) {
    return res.status(400).json({ message: "Valid programOutcomes array is required." });
  }
  next();
}

export function validateProgramGenerate(req, res, next) {
  const { programName, difficultyLevel, numberOfWeeks } = req.body;

  if (!programName || programName.trim().length < 3) {
    return res.status(400).json({
      message: "Program name must be at least 3 characters"
    });
  }
  if (!["beginner", "intermediate", "advanced"].includes(difficultyLevel)) {
    return res.status(400).json({
      message: "Difficulty must be beginner, intermediate, or advanced"
    });
  }
  const weeks = Number(numberOfWeeks);
  if (!weeks || weeks < 1 || weeks > 50 || !Number.isInteger(weeks)) {
    return res.status(400).json({
      message: "Number of weeks must be a whole number between 1 and 50"
    });
  }
  
  if (req.body.includesCapstone === undefined ||
      req.body.includesCapstone === null ||
      typeof req.body.includesCapstone !== "boolean") {
    return res.status(400).json({
      message: "Capstone project selection is required (true or false)"
    });
  }
  
  next();
}

export function validateChatMessage(req, res, next) {
  const { contextType, contextId, userMessage } = req.body

  if (!["curriculum", "course", "program"].includes(contextType))
    return res.status(400).json({
      message: "Invalid context type"
    })
  if (!contextId)
    return res.status(400).json({
      message: "Context ID is required"
    })
  if (!userMessage || userMessage.trim().length === 0)
    return res.status(400).json({
      message: "Message cannot be empty"
    })
  if (userMessage.trim().length > 500)
    return res.status(400).json({
      message: "Message cannot exceed 500 characters"
    })
  next()
}
