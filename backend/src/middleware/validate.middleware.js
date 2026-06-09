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
