import Groq from "groq-sdk";
import config from "../config/env.js";
import { buildSemesterPlan } from "../utils/creditPlan.js";

const groq = new Groq({ apiKey: config.groqApiKey });

// ─────────────────────────────────────────────
// STEP 2: Ask Groq ONLY for names and metadata
// No credit fields in the schema at all
// ─────────────────────────────────────────────
async function callWithRetry(fn, retries = 3, delayMs = 2000) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isRetryable =
        err.message?.includes("rate_limit")  ||
        err.message?.includes("429")         ||
        err.status === 429;
      if (isRetryable && attempt < retries) {
        await new Promise(res => setTimeout(res, delayMs));
        delayMs *= 2;
        continue;
      }
      throw err;
    }
  }
}

const generateCurriculum = async (programData, customInstructions = "") => {

  // ── Pre-compute full credit plan in JS ──
  const plan = buildSemesterPlan(programData);

  // ── Build the slot description for the prompt ──
  // Tell Groq exactly how many courses per semester and their types.
  // Do NOT mention credits in the prompt at all.
  const semesterInstructions = plan.semesterPlans.map(sem => {
    const slotLines = sem.slots.map((slot, i) =>
      `    Course ${i + 1}: type="${slot.type}"`
    ).join("\n");

    return `
  Semester ${sem.semesterNumber} (${sem.progressionStage}):
    Generate exactly ${sem.slots.length} courses in this order:
${slotLines}
    ${sem.semesterNumber === 1
      ? "All prerequisites must be null."
      : "Prerequisites must reference courseCodes from earlier semesters or be null."}
    ${sem.progressionStage === "capstone"
      ? "Last course must be a Capstone Project or Industry Project."
      : ""}
    `.trim();
  }).join("\n\n");

  const deptPrefix = programData.department
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);

  // ── Call Groq for names and metadata only ──
  const response = await callWithRetry(() =>
    groq.chat.completions.create({
      model            : "llama-3.3-70b-versatile",
      temperature      : 0.4,
      max_tokens       : 8000,
      response_format  : { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
          `You are an expert academic curriculum designer specializing in
           outcome-based education (OBE).

           ABSOLUTE RULES:
           1. Return ONLY valid JSON. No markdown, no explanation, no fences.
           2. Generate EXACTLY the semesters and courses specified.
              Each semester must have EXACTLY the number of courses listed.
           3. Do NOT include any credits field anywhere in your response.
              Credits are handled separately. Omit them entirely.
           4. Course codes use this prefix: "${deptPrefix}"
              Semester 1 codes: ${deptPrefix}101, ${deptPrefix}102 ...
              Semester 2 codes: ${deptPrefix}201, ${deptPrefix}202 ...
              No duplicate codes.
           5. Course names must be specific to the specialization.
              Never generic. Never placeholder names.
           6. difficultyLevel: "beginner"|"intermediate"|"advanced" only.
           7. hasLab: true for courses with practical components.
              At least 30% of all courses must have hasLab: true.
           8. prerequisite: courseCode string from a previous semester or null.
              Semester 1 always null.
           9. type must match exactly what is specified per course slot.
           10. Generate 8 to 12 program outcomes specific to the specialization.${customInstructions ? "\n\nCUSTOM INSTITUTION INSTRUCTIONS:\n" + customInstructions : ""}`
        },
        {
          role: "user",
          content:
          `Design a curriculum for this program:

  Program     : ${programData.programName}
  Degree      : ${programData.degreeType}
  Department  : ${programData.department}
  Specialization: ${programData.specialization}
  Duration    : ${programData.durationYears} years /
                ${programData.durationSemesters} semesters
  Career Goals: ${programData.careerGoals || "Not specified"}

  SEMESTER INSTRUCTIONS:
  Generate exactly ${programData.durationSemesters} semesters.
  For each semester, generate courses in the exact quantity and type
  order specified below. Do NOT add extra courses. Do NOT skip courses.

  ${semesterInstructions}

  COURSE NAMING GUIDE:
  Specialization is "${programData.specialization}".
  All course names must reflect this specialization.
  Example good names:
    - "Machine Learning Fundamentals for ${programData.specialization}"
    - "Advanced ${programData.specialization} Techniques"
    - "Industry Applications in ${programData.specialization}"

  Return this exact JSON schema:
  {
    "semesters": [
      {
        "semesterNumber": number,
        "courses": [
          {
            "courseCode": string,
            "courseName": string,
            "type": "core"|"elective"|"open_elective",
            "hasLab": boolean,
            "prerequisite": string|null,
            "difficultyLevel": "beginner"|"intermediate"|"advanced"
          }
        ]
      }
    ],
    "programOutcomes": [
      { "poNumber": number, "statement": string }
    ]
  }

  REMINDER: Do NOT include any credits field anywhere.
  Credits are not part of your output.`
        }
      ]
    })
  );

  // ── Parse Groq response ──
  const raw     = response.choices[0].message.content;
  const cleaned = raw.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Groq returned invalid JSON: " + e.message);
  }

  // ─────────────────────────────────────────────
  // STEP 3: Merge JS-computed credits into parsed
  // Credits come entirely from plan — not from Groq
  // ─────────────────────────────────────────────

  // Validate semester count first
  if (parsed.semesters.length !== programData.durationSemesters) {
    throw new Error(
      `Wrong number of semesters: got ${parsed.semesters.length}, ` +
      `expected ${programData.durationSemesters}`
    );
  }

  // Merge credits from plan into each course
  for (let sIdx = 0; sIdx < parsed.semesters.length; sIdx++) {
    const semester     = parsed.semesters[sIdx];
    const semPlan      = plan.semesterPlans[sIdx];

    // Validate course count matches plan
    if (semester.courses.length !== semPlan.slots.length) {
      // Auto-fix: trim extra or pad missing courses
      console.warn(
        `Semester ${semester.semesterNumber}: expected ` +
        `${semPlan.slots.length} courses, got ${semester.courses.length}. ` +
        `Auto-adjusting.`
      );
      // Trim if too many
      semester.courses = semester.courses.slice(0, semPlan.slots.length);
      // Pad if too few
      while (semester.courses.length < semPlan.slots.length) {
        const missing = semPlan.slots.length - semester.courses.length;
        const padIdx  = semester.courses.length;
        semester.courses.push({
          courseCode     : `${deptPrefix}${sIdx + 1}0${padIdx + 1}`,
          courseName     : `${programData.specialization} Elective ${padIdx + 1}`,
          type           : semPlan.slots[padIdx].type,
          hasLab         : false,
          prerequisite   : null,
          difficultyLevel: "intermediate"
        });
      }
    }

    // Assign credits from plan (overwrite anything Groq may have put)
    for (let cIdx = 0; cIdx < semester.courses.length; cIdx++) {
      semester.courses[cIdx].credits = semPlan.slots[cIdx].credits;
      // Also enforce type from plan (Groq must not override type)
      semester.courses[cIdx].type    = semPlan.slots[cIdx].type;
    }

    // Set semester totalCredits from plan (not from Groq)
    semester.totalCredits = semPlan.targetCredits;

    // Verify the merge is correct (this should NEVER fail now)
    const courseSum = semester.courses.reduce((s, c) => s + c.credits, 0);
    if (courseSum !== semester.totalCredits) {
      throw new Error(
        `Merge error in semester ${semester.semesterNumber}: ` +
        `courses sum ${courseSum} !== plan target ${semester.totalCredits}. ` +
        `This is a code bug, not a Groq error.`
      );
    }
  }

  // ── Verify grand total — must be exact now ──
  const grandTotal = parsed.semesters.reduce(
    (sum, sem) => sum + sem.totalCredits, 0
  );
  if (grandTotal !== programData.totalCredits) {
    throw new Error(
      `Grand total error after merge: ${grandTotal} !== ` +
      `${programData.totalCredits}. This is a code bug.`
    );
  }

  // ── Compute programSummary from course data ──
  let coreTotal = 0, electiveTotal = 0, openElectiveTotal = 0;
  for (const sem of parsed.semesters) {
    for (const course of sem.courses) {
      if (course.type === "core")              coreTotal         += course.credits;
      else if (course.type === "elective")     electiveTotal     += course.credits;
      else if (course.type === "open_elective") openElectiveTotal += course.credits;
    }
  }
  parsed.programSummary = {
    totalCoreCredits         : coreTotal,
    totalElectiveCredits     : electiveTotal,
    totalOpenElectiveCredits : openElectiveTotal
  };

  // ── Duplicate course code check ──
  const allCodes = parsed.semesters.flatMap(
    sem => sem.courses.map(c => c.courseCode)
  );
  const uniqueCodes = new Set(allCodes);
  if (allCodes.length !== uniqueCodes.size) {
    const dupes = allCodes.filter((c, i) => allCodes.indexOf(c) !== i);
    throw new Error(`Duplicate course codes: ${[...new Set(dupes)].join(", ")}`);
  }

  // ── Program outcomes check ──
  if (
    !parsed.programOutcomes ||
    parsed.programOutcomes.length < 8 ||
    parsed.programOutcomes.length > 12
  ) {
    throw new Error(
      `Invalid number of program outcomes: ` +
      `got ${parsed.programOutcomes?.length ?? 0}, expected 8–12`
    );
  }

  return parsed;
};

// ─────────────────────────────────────────────
// Course Syllabus Generation
// ─────────────────────────────────────────────
export const generateCourseSyllabus = async (courseData, customInstructions = "") => {
  const response = await callWithRetry(() =>
    groq.chat.completions.create({
      model           : "llama-3.3-70b-versatile",
      temperature     : 0.4,
      max_tokens      : 6000,
      response_format : { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
          `You are an expert academic course designer specializing in
           outcome-based education. You design detailed, industry-relevant
           course syllabi for university programs.
           RULES:
           1. Return ONLY valid JSON. No markdown, no explanation.
           2. Unit topics must be specific to the course domain.
           3. Estimated hours per unit must be realistic.
              Total hours across all units should be approximately
              ${courseData.credits * 15} (standard credit hour formula).
           4. Prerequisites must be realistic for the difficulty level.
           5. Course objectives must start with Bloom's action verbs.
           6. If includesLab is true, generate labSyllabus array.
              If false, return labSyllabus as empty array [].${customInstructions ? "\n\nCUSTOM INSTITUTION INSTRUCTIONS:\n" + customInstructions : ""}`
        },
        {
          role: "user",
          content:
          `Design a complete course syllabus for:

   Course Name      : ${courseData.courseName}
   Course Code      : ${courseData.courseCode}
   Credits          : ${courseData.credits}
   Difficulty Level : ${courseData.difficultyLevel}
   Number of Units  : ${courseData.numberOfUnits}
   Course Type      : ${courseData.courseType}
   Includes Lab     : ${courseData.includesLab ? "Yes" : "No"}
   ${courseData.includesLab ? `Number of Experiments: ${courseData.numberOfExperiments}` : ""}

   Total contact hours target: ${courseData.credits * 15} hours
   Distribute these hours across ${courseData.numberOfUnits} units.

   Return this exact JSON:
   {
     "courseDescription": string (2-3 sentences),
     "prerequisites": [string],
     "courseObjectives": [string] (5-7 objectives with Bloom's verbs),
     "units": [
       {
         "unitNumber": number,
         "unitTitle": string,
         "topics": [string] (4-7 topics per unit),
         "estimatedHours": number
       }
     ],
     "labSyllabus": [
       {
         "experimentNumber": number,
         "title": string,
         "aim": string,
         "estimatedHours": number
       }
     ]
   }`
        }
      ]
    })
  );

  const raw     = response.choices[0].message.content;
  const cleaned = raw.replace(/```json|```/g, "").trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Groq returned invalid JSON for course: " + e.message);
  }

  if (!parsed.units || parsed.units.length !== courseData.numberOfUnits) {
    throw new Error(`Wrong number of units generated: got ${parsed.units?.length ?? 0}, expected ${courseData.numberOfUnits}`);
  }
  if (courseData.includesLab) {
    if (!parsed.labSyllabus || parsed.labSyllabus.length !== courseData.numberOfExperiments) {
      throw new Error(`Wrong number of lab experiments: got ${parsed.labSyllabus?.length ?? 0}, expected ${courseData.numberOfExperiments}`);
    }
  } else {
    parsed.labSyllabus = [];
  }

  return parsed;
};

export const generateCourseOutcomes = async (syllabusText, customInstructions = "") => {
  const response = await callWithRetry(() =>
    groq.chat.completions.create({
      model           : "llama-3.3-70b-versatile",
      temperature     : 0.2,
      max_tokens      : 3000,
      response_format : { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
          `You are an expert in outcome-based education (OBE) and curriculum design.
           Generate exactly 5 to 6 Course Outcomes (COs) for the provided syllabus text.
           
           RULES:
           1. Return ONLY valid JSON. No markdown, no explanation.
           2. Each CO must start with an action verb from Bloom's taxonomy.
           3. Assign a primary Bloom's taxonomy level to each CO.
              (e.g., "Remembering", "Understanding", "Applying", "Analyzing", "Evaluating", "Creating")
           4. The COs must be clear, measurable, and specific to the syllabus.
           ${customInstructions ? "\n\nCUSTOM INSTRUCTIONS:\n" + customInstructions : ""}`
        },
        {
          role: "user",
          content:
          `Based on the following syllabus text, generate the Course Outcomes.
          
           SYLLABUS TEXT:
           ${syllabusText.substring(0, 15000)}
           
           Return this exact JSON:
           {
             "courseOutcomes": [
               {
                 "coNumber": number,
                 "statement": string,
                 "bloomsLevel": string
               }
             ]
           }`
        }
      ]
    })
  );

  const raw     = response.choices[0].message.content;
  const cleaned = raw.replace(/```json|```/g, "").trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Groq returned invalid JSON for course outcomes: " + e.message);
  }

  return parsed;
};

export const generateCOPOMatrix = async (courseOutcomes, programOutcomes, customInstructions = "") => {
  const response = await callWithRetry(() =>
    groq.chat.completions.create({
      model           : "llama-3.3-70b-versatile",
      temperature     : 0.1,
      max_tokens      : 3000,
      response_format : { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
          `You are an expert in outcome-based education (OBE) accreditation.
You generate CO-PO correlation matrices for NBA/NAAC compliance.

CORRELATION SCALE (strictly follow this):
  3 = High   : The CO directly and substantially addresses the PO.
               The connection is explicit in the CO statement.
               Use sparingly — maximum 20% of cells should be 3.
  2 = Medium : The CO partially addresses the PO or supports it
               indirectly. A clear but not primary connection.
  1 = Low    : The CO has a minor or peripheral relation to the PO.
               Use when there is a weak but real connection.
  0 = None   : No meaningful relationship. Use this most often.

REALISTIC MATRIX EXPECTATIONS:
  - A typical CO maps strongly (3) to 1–2 POs only
  - A typical CO maps moderately (2) to 2–3 POs
  - Most cells (50–60%) should be 0
  - Average matrix value should be between 1.0 and 2.0
  - A row where every PO gets 2 or 3 is almost certainly wrong

MAPPING METHODOLOGY:
  Step 1: Read the CO statement carefully.
  Step 2: Identify the core skill or knowledge it targets.
  Step 3: For each PO, ask:
    "Does this CO directly help achieve this PO?"
    Yes, primarily   → 3
    Yes, partially   → 2
    Tangentially     → 1
    No               → 0
  Step 4: Verify no CO row has more than 3 cells with value 3.

ABSOLUTE RULES:
1. Return ONLY valid JSON. No markdown, no explanation, no fences.
2. Every CO must have exactly one mapping entry per PO.
   No missing cells. No extra cells.
3. Correlation values must be exactly 0, 1, 2, or 3.
   No decimals. No nulls. No empty strings.
4. coNumber values must match the input CO numbers exactly.
5. poNumber values must match the input PO numbers exactly.
6. Do not invent POs or COs not present in the input.${customInstructions ? "\n\nCUSTOM INSTRUCTIONS:\n" + customInstructions : ""}`
        },
        {
          role: "user",
          content:
          `Generate a CO-PO matrix for the following:
          
           COURSE OUTCOMES:
           ${JSON.stringify(courseOutcomes, null, 2)}
           
           PROGRAM OUTCOMES:
           ${JSON.stringify(programOutcomes, null, 2)}
           
           Return this exact JSON:
           {
             "copoMatrix": [
               {
                 "coNumber": number,
                 "poMappings": [
                   {
                     "poNumber": number,
                     "correlationLevel": number
                   }
                 ]
               }
             ]
           }`
        }
      ]
    })
  );

  const raw     = response.choices[0].message.content;
  const cleaned = raw.replace(/```json|```/g, "").trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Groq returned invalid JSON for CO-PO matrix: " + e.message);
  }

  return parsed;
};

export const generateWeeklyProgram = async (programData) => {
  const response = await callWithRetry(() =>
    groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 8000,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an expert program designer and instructional designer
   with 20+ years of experience creating structured learning programs,
   workshops, and bootcamps across technical and non-technical domains.

   You design week-wise schedules that are:
   - Pedagogically sound with clear learning progression
   - Practical with hands-on activities and deliverables
   - Calibrated precisely to the difficulty level specified
   - Realistic in scope for the number of weeks given

   DIFFICULTY CALIBRATION:
   beginner:
     - Assume zero prior knowledge of the subject
     - Start with fundamentals and core concepts
     - More time on each topic, slower progression
     - Activities are guided and structured
     - Deliverables are small, well-defined exercises
     - Avoid jargon — explain everything
     - Weeks 1-2: orientation and foundations only

   intermediate:
     - Assume basic familiarity with the domain
     - Move faster through fundamentals
     - Focus on practical application and real-world use cases
     - Activities include independent problem-solving
     - Deliverables are mini-projects or applied exercises
     - Some industry tools and practices introduced

   advanced:
     - Assume strong domain knowledge
     - Skip basics entirely — start at applied/expert level
     - Focus on cutting-edge topics, research, and complex systems
     - Activities are open-ended and research-oriented
     - Deliverables are substantial projects or papers
     - Industry-grade tools and professional practices expected

   WEEK COUNT CALIBRATION:
   1-2 weeks   : Focused crash course — 2 to 4 major topics only
                 No room for deep dives. Prioritize ruthlessly.
   3-6 weeks   : Short program — cover fundamentals + 1 project
   7-12 weeks  : Standard bootcamp — full topic coverage + 2 projects
   13-24 weeks : Extended program — deep coverage + capstone project
   25-50 weeks : Full course — comprehensive with multiple milestones

   ABSOLUTE RULES:
   1. Return ONLY valid JSON. No markdown, no explanation, no fences.
   2. Generate EXACTLY the number of weeks specified. Not more, not less.
   3. weekNumber must start at 1 and increment by 1 with no gaps.
   4. Each week must have at least 3 topics and 2 activities.
   5. estimatedHours per week must be realistic:
      beginner    : 8–12 hours per week
      intermediate: 10–15 hours per week
      advanced    : 12–20 hours per week
   6. Topics must be specific to the program domain.
      Never generic placeholders like "Introduction to Topic".
      Use "Introduction to LangChain Agent Executors" instead.
   7. learningOutcomes must be 4 to 8 statements starting with
      Bloom's action verbs.
   8. recommendedTools must be actual tools, frameworks, or
      platforms relevant to the program (3 to 8 items).
   9. programSummary.totalHours must equal sum of all
      week estimatedHours. Compute this yourself.
   10. If includesCapstone is true:
       a. The LAST week of the schedule must be dedicated to the
          capstone project presentation and submission.
          weekTitle must include "Capstone" explicitly.
       b. The second-to-last week must be capstone development/review.
       c. All earlier weeks must build toward the capstone project.
       d. The capstoneProject object must be fully populated.
       e. capstoneProject.suggestedWeeks must equal 2 (last 2 weeks)
          for programs <= 8 weeks, 3 for programs > 8 weeks.
   11. If includesCapstone is false:
       a. Return capstoneProject as null.
       b. No week should mention "capstone" in title or topics.
       c. Last week should be a review, consolidation, or
          final assessment week instead.
   ${programData.customInstructions ? "\n\nCUSTOM INSTITUTION INSTRUCTIONS:\n" + programData.customInstructions : ""}`
        },
        {
          role: "user",
          content: `Design a complete week-wise program schedule for:

   Program Name     : ${programData.programName}
   Difficulty Level : ${programData.difficultyLevel}
   Number of Weeks  : ${programData.numberOfWeeks}
   Capstone Project : ${programData.includesCapstone ? "Yes" : "No"}

   PROGRESSION RULES FOR THIS PROGRAM:
   ${programData.difficultyLevel === "beginner" ? `
   - Week 1: orientation, why this topic matters, big picture overview
   - Week 2: absolute fundamentals and core vocabulary
   - Middle weeks: build concepts gradually, each week on previous
   - Last week: review, consolidation, and next steps guidance` : ""}
   ${programData.difficultyLevel === "intermediate" ? `
   - Week 1: quick recap of prerequisites, set expectations
   - Early weeks: core concepts with practical exercises
   - Middle weeks: applied projects and real-world scenarios
   - Last week: capstone mini-project or integration exercise` : ""}
   ${programData.difficultyLevel === "advanced" ? `
   - Week 1: jump straight into complex concepts
   - Early weeks: advanced theory and architecture
   - Middle weeks: research topics, complex implementations
   - Last week: original project, research paper, or system design` : ""}

   ${programData.includesCapstone ? `
   CAPSTONE RULES FOR THIS PROGRAM:
   - Reserve the last ${programData.numberOfWeeks > 8 ? 3 : 2} weeks
     for capstone work:
     ${programData.numberOfWeeks > 8
       ? `Second to last 2 weeks: capstone development and peer review
          Last week: final presentation, submission, evaluation`
       : `Second to last week: capstone development and review
          Last week: final presentation and submission`}
   - All earlier weeks must have topics that feed into the capstone.
   - The capstoneProject object must have:
       title            : a specific project title matching the domain
       description      : 2-3 sentences on what the learner builds
       objectives       : 3 to 5 specific project objectives
       deliverables     : 3 to 5 tangible submission items
       evaluationCriteria: 3 to 5 criteria for grading/assessment
       suggestedWeeks   : ${programData.numberOfWeeks > 8 ? 3 : 2}
   ` : `
   FINAL WEEK RULES:
   - Last week must be review, consolidation, and next steps.
   - No capstone content.
   - capstoneProject must be null in the response.
   `}

   Generate EXACTLY ${programData.numberOfWeeks} week entries.

   For each week provide:
   - weekTitle    : compelling title for that week's focus
   - theme        : one-line theme or learning arc for the week
   - topics       : 3 to 6 specific topics covered (be precise)
   - activities   : 2 to 4 hands-on activities or exercises
   - deliverables : 1 to 3 tangible outputs the learner produces
   - estimatedHours: realistic hours for ${programData.difficultyLevel} level

   Return this exact JSON:
   {
     "programOverview"  : "string (3-4 sentences about the program)",
     "targetAudience"   : "string (1-2 sentences)",
     "prerequisites"    : ["string"] (3 to 6 items, or ["None"] for beginner),
     "learningOutcomes" : ["string"] (4 to 8 Bloom's verb outcomes),
     "weeklySchedule"   : [
       {
         "weekNumber"    : "number",
         "weekTitle"     : "string",
         "theme"         : "string",
         "topics"        : ["string"],
         "activities"    : ["string"],
         "deliverables"  : ["string"],
         "estimatedHours": "number"
       }
     ],
     "programSummary": {
       "totalHours"       : "number",
       "totalTopics"      : "number",
       "totalDeliverables": "number",
       "recommendedTools" : ["string"],
       "hasCapstone"      : "boolean"
     },
     "capstoneProject": {
       "title"             : "string",
       "description"       : "string",
       "objectives"        : ["string"],
       "deliverables"      : ["string"],
       "evaluationCriteria": ["string"],
       "suggestedWeeks"    : "number"
     }
   }`
        }
      ]
    })
  );

  const raw = response.choices[0].message.content;
  const cleaned = raw.replace(/```json|```/g, "").trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Groq returned invalid JSON for weekly program: " + e.message);
  }

  // VALIDATE
  if (!parsed.weeklySchedule || parsed.weeklySchedule.length !== programData.numberOfWeeks) {
    throw new Error(`Wrong number of weeks: got ${parsed.weeklySchedule?.length || 0}, expected ${programData.numberOfWeeks}`);
  }

  for (let i = 0; i < parsed.weeklySchedule.length; i++) {
    if (parsed.weeklySchedule[i].weekNumber !== i + 1) {
      parsed.weeklySchedule[i].weekNumber = i + 1;
    }
  }

  const actualTotalHours = parsed.weeklySchedule.reduce((sum, w) => sum + w.estimatedHours, 0);
  if (!parsed.programSummary) parsed.programSummary = {};
  parsed.programSummary.totalHours = actualTotalHours;

  parsed.programSummary.totalTopics = parsed.weeklySchedule.reduce((sum, w) => sum + (w.topics?.length || 0), 0);
  parsed.programSummary.totalDeliverables = parsed.weeklySchedule.reduce((sum, w) => sum + (w.deliverables?.length || 0), 0);

  if (!parsed.learningOutcomes || parsed.learningOutcomes.length < 4 || parsed.learningOutcomes.length > 8) {
    throw new Error("Invalid number of learning outcomes");
  }

  // Capstone validation
  if (programData.includesCapstone) {
    if (!parsed.capstoneProject) {
      throw new Error("Capstone was requested but capstoneProject is missing");
    }

    const cp = parsed.capstoneProject;

    if (!cp.title || !cp.description)
      throw new Error("Capstone project missing title or description");

    if (!cp.objectives || cp.objectives.length < 3)
      throw new Error("Capstone must have at least 3 objectives");

    if (!cp.deliverables || cp.deliverables.length < 3)
      throw new Error("Capstone must have at least 3 deliverables");

    if (!cp.evaluationCriteria || cp.evaluationCriteria.length < 3)
      throw new Error("Capstone must have at least 3 evaluation criteria");

    // Verify last week mentions capstone
    const lastWeek = parsed.weeklySchedule[parsed.weeklySchedule.length - 1];
    if (!lastWeek.weekTitle.toLowerCase().includes("capstone")) {
      lastWeek.weekTitle = lastWeek.weekTitle + " (Capstone)";
      console.warn("Last week title did not include capstone — auto-corrected");
    }

    parsed.programSummary.hasCapstone = true;
  } else {
    parsed.capstoneProject = null;
    parsed.programSummary.hasCapstone = false;
  }

  return parsed;
};

export { generateCurriculum };
