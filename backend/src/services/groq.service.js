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

export { generateCurriculum };
