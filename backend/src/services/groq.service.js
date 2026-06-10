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
    Lab limit: MAXIMUM ${sem.labBudget} courses with hasLab: true in this semester.
               Do not exceed this limit under any circumstances.
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
           5. COURSE NAMING — follow these rules strictly:
              a. Course names must be SHORT and STANDARD.
                 Use the universally accepted name for the subject.
                 Do NOT append the program name, specialization name,
                 department name, or degree name to course titles.
              b. WRONG naming patterns (never do these):
                 'Data Structures for Artificial Intelligence'
                 'Machine Learning for Computer Science Engineering'
                 'Mathematics for AI and ML Program'
                 'Python Programming for AIML Students'
                 'Database Management for B.Tech CSE'
              c. CORRECT naming patterns (always do these):
                 'Data Structures and Algorithms'
                 'Machine Learning'
                 'Engineering Mathematics'
                 'Python Programming'
                 'Database Management Systems'
              d. The specialization context is already known from the
                 program details. Course names do not need to repeat it.
                 A course name should be what appears on a university
                 transcript — concise, standard, and discipline-neutral.
              e. Specialization-specific courses ARE allowed when the
                 course is genuinely unique to that domain:
                 OK: 'Natural Language Processing'
                 OK: 'Computer Vision'
                 OK: 'Reinforcement Learning'
                 OK: 'Embedded Systems Programming'
                 NOT OK: 'Natural Language Processing for AIML'
                 NOT OK: 'Computer Vision Techniques for AI Students'
              f. Maximum course name length: 6 words.
                 If a name exceeds 6 words, shorten it.
                 'Advanced Topics in Deep Learning Architectures for AI'
                 → 'Advanced Deep Learning Architectures'
           6. difficultyLevel: "beginner"|"intermediate"|"advanced" only.
           7. hasLab: true for courses with practical components.
              At least 30% of all courses must have hasLab: true.
           8. LAB DISTRIBUTION — follow this exactly:
              a. Maximum 3 lab courses per semester. Hard limit.
              b. Recommended distribution pattern:
                 Early semesters (first half): maximum 3 labs/semester
                 Later semesters (second half): maximum 2 labs/semester
              c. Count hasLab: true courses per semester carefully.
                 If a semester would exceed the limit, set the least
                 critical course's hasLab to false instead.
              d. Courses that should NEVER have a lab:
                 Mathematics, Statistics, Theory courses, History of X,
                 Management courses, Seminar courses, Project courses
                 (projects are separate from labs)
              e. Courses that should ALWAYS have a lab when present:
                 Programming courses, Networking, Operating Systems,
                 Database courses, any course with 'Laboratory' or
                 'Practical' in the name
              f. Overall cap: no more than 40% of total courses across
                 the entire curriculum should have hasLab: true.
           9. PREREQUISITE ORDERING — this is critical:
              a. Semester 1 courses MUST have prerequisite: null always.
              b. A course in semester N can ONLY list a prerequisite
                 from semester 1 to N-1. NEVER from the same semester N.
              c. Before assigning a prerequisite, ask yourself:
                 'Can a student realistically take both courses at the
                 same time?' If yes → prerequisite: null.
                 If no (one must come before the other) → assign the
                 earlier course as prerequisite and place the dependent
                 course in a LATER semester.
              d. Common ordering rules to always follow:
                 - Programming/Coding fundamentals → must come before
                   Data Structures, Algorithms, any advanced coding course
                 - Mathematics (Calculus, Linear Algebra) → must come
                   before courses that use them (ML, Signal Processing)
                 - Any 'Fundamentals of X' or 'Introduction to X' course
                   → must come at least one semester before 'Advanced X'
                   or 'X Applications' or 'X for Y'
                 - Database basics → must come before advanced DB courses
                 - Networking basics → before security or cloud courses
              e. If course B depends on course A:
                 course A semester number MUST be strictly less than
                 course B semester number. Never equal.
              f. Double-check every prerequisite assignment before
                 finalizing. A wrong prerequisite placement is the most
                 common error in curriculum generation.
           10. type must match exactly what is specified per course slot.
           11. Generate 8 to 12 program outcomes specific to the specialization.${customInstructions ? "\n\nCUSTOM INSTITUTION INSTRUCTIONS:\n" + customInstructions : ""}`
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
  Keep course names SHORT, STANDARD, and UNIVERSAL.
  Do NOT include '${programData.specialization}' or
  '${programData.department}' or '${programData.degreeType}'
  inside any course name.

  Think: what would this course be called on a university
  transcript? That is the name to use.

  Good examples for any program:
    'Data Structures and Algorithms'
    'Operating Systems'
    'Computer Networks'
    'Linear Algebra'
    'Probability and Statistics'
    'Object Oriented Programming'
    'Software Engineering'
    'Artificial Intelligence'
    'Machine Learning'
    'Deep Learning'
    'Computer Vision'
    'Natural Language Processing'

  Bad examples — never do this:
    'Data Structures for ${programData.specialization}'
    'Machine Learning for ${programData.department} Students'
    'Applied Mathematics for ${programData.programName}'

  PREREQUISITES AND ORDERING GUIDE:
  For every course, follow this exact process:

  a. Ask: does this course require knowledge from another
     course in this curriculum?
     Yes → identify which course, verify that course is in
            an EARLIER semester, then assign its courseCode.
     No  → prerequisite: null

  b. SAME SEMESTER CHECK: If course A and course B are both
     in semester N, neither can be a prerequisite of the other.
     If one must come before the other, move the dependent
     course to semester N+1 or later.

  c. Mandatory orderings for this curriculum:
     - Place all foundational courses (intro, fundamentals,
       basics) in semesters 1 or 2.
     - Place all intermediate courses in semesters 3 or 4.
     - Place all advanced and applied courses in semesters
       5 and beyond.
     - No advanced course should appear before semester 4.

  d. After generating all semesters, do a final pass:
     For each course with a non-null prerequisite,
     verify: prerequisite course semester < this course semester.
     If this check fails, either move the course or
     set prerequisite: null.

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

  // ── Lab enforcement: cap labs per semester ──
  for (let sIdx = 0; sIdx < parsed.semesters.length; sIdx++) {
    const semester  = parsed.semesters[sIdx];
    const semPlan   = plan.semesterPlans[sIdx];
    const labBudget = semPlan.labBudget;

    const labCourses = semester.courses.filter(c => c.hasLab === true);

    if (labCourses.length > labBudget) {
      console.warn(
        `Semester ${semester.semesterNumber}: has ${labCourses.length}` +
        ` labs, budget is ${labBudget}. Auto-correcting.`
      );

      const theoryKeywords = [
        "mathematics", "math", "statistics", "theory", "history",
        "management", "seminar", "ethics", "communication",
        "economics", "law", "design thinking"
      ];

      let flipped = 0;
      const needed = labCourses.length - labBudget;

      for (const course of labCourses) {
        if (flipped >= needed) break;
        const nameLower = course.courseName.toLowerCase();
        const isTheory  = theoryKeywords.some(k => nameLower.includes(k));
        if (isTheory) {
          course.hasLab = false;
          flipped++;
        }
      }

      if (flipped < needed) {
        const stillLabCourses = semester.courses
          .filter(c => c.hasLab === true)
          .reverse();

        for (const course of stillLabCourses) {
          if (flipped >= needed) break;
          course.hasLab = false;
          flipped++;
        }
      }
    }
  }

  // ── Global lab cap: max 40% of all courses ──
  const allCourses  = parsed.semesters.flatMap(s => s.courses);
  const totalCourses = allCourses.length;
  const labCourses   = allCourses.filter(c => c.hasLab === true);
  const labRatio     = labCourses.length / totalCourses;

  if (labRatio > 0.40) {
    console.warn(
      `Global lab ratio is ${(labRatio * 100).toFixed(1)}% ` +
      `(${labCourses.length}/${totalCourses}). Trimming to 40% cap.`
    );
    const maxLabs    = Math.floor(totalCourses * 0.40);
    const toFlip     = labCourses.length - maxLabs;

    const theoryKeywords = [
      "mathematics", "math", "statistics", "theory", "history",
      "management", "seminar", "ethics", "communication",
      "economics", "law", "design thinking"
    ];

    let flipped = 0;

    for (const course of allCourses) {
      if (flipped >= toFlip) break;
      if (!course.hasLab) continue;
      const nameLower = course.courseName.toLowerCase();
      if (theoryKeywords.some(k => nameLower.includes(k))) {
        course.hasLab = false;
        flipped++;
      }
    }

    const reversedCourses = [...allCourses].reverse();
    for (const course of reversedCourses) {
      if (flipped >= toFlip) break;
      if (!course.hasLab) continue;
      course.hasLab = false;
      flipped++;
    }
  }

  // ── Prerequisite ordering validation and auto-fix ──
  const codeToSemester = {};
  for (const semester of parsed.semesters) {
    for (const course of semester.courses) {
      codeToSemester[course.courseCode] = semester.semesterNumber;
    }
  }

  for (const semester of parsed.semesters) {
    for (const course of semester.courses) {
      if (!course.prerequisite) continue;

      const prereqSemester = codeToSemester[course.prerequisite];

      if (prereqSemester === undefined) {
        console.warn(
          `Course ${course.courseCode} has prerequisite ` +
          `${course.prerequisite} which does not exist. Clearing.`
        );
        course.prerequisite = null;
      } else if (prereqSemester >= semester.semesterNumber) {
        console.warn(
          `Course ${course.courseCode} (sem ${semester.semesterNumber})` +
          ` has prerequisite ${course.prerequisite}` +
          ` (sem ${prereqSemester}). Same/later semester. Clearing.`
        );
        course.prerequisite = null;
      }
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
           
           BLOOM'S TAXONOMY REFERENCE:
           Remember   (L1): Define, List, Recall, Recognize, State,
                            Identify, Name, Reproduce, Match, Label,
                            Retrieve, Repeat, Describe
           Understand (L2): Explain, Summarize, Classify, Discuss,
                            Interpret, Paraphrase, Compare, Contrast,
                            Distinguish, Infer, Illustrate, Predict
           Apply      (L3): Solve, Demonstrate, Implement, Use,
                            Execute, Compute, Construct, Modify,
                            Produce, Sketch, Apply, Calculate, Show
           Analyze    (L4): Differentiate, Examine, Compare, Breakdown,
                            Inspect, Distinguish, Organize, Attribute,
                            Diagram, Deconstruct, Relate, Prioritize
           Evaluate   (L5): Justify, Assess, Critique, Judge, Argue,
                            Defend, Appraise, Recommend, Select,
                            Measure, Support, Validate
           Create     (L6): Design, Develop, Construct, Formulate,
                            Produce, Plan, Compose, Generate,
                            Hypothesize, Invent, Build, Integrate

           RULES:
           1. Return ONLY valid JSON. No markdown, no explanation.
           2. Each CO must start with a present tense base form action
              verb from Bloom's taxonomy reference above.
              The verb must NOT end in 'ing', 'ed', or 'ly'.
              It must be the base infinitive form: Design not Designing,
              Analyze not Analyzing, Evaluate not Evaluating.
           3. Assign a primary Bloom's taxonomy level to each CO.
              (e.g., "Remembering", "Understanding", "Applying", "Analyzing", "Evaluating", "Creating")
           4. The COs must be clear, measurable, and specific to the syllabus.
           5. bloomsVerb must be the exact first word of the CO statement.
              The verb must be in present tense base form.
              NEVER use gerunds (verbs ending in 'ing') as the CO verb.
              Wrong : 'Designing a REST API...'
              Correct: 'Design a REST API...'
              Wrong : 'Applying machine learning...'
              Correct: 'Apply machine learning...'
              Every CO statement must begin with a capitalized present
              tense verb from the Bloom's reference list above.
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

export const chatWithContext = async (chatData) => {
  function buildContextSummary(contextType, contextData) {
    if (contextType === "curriculum") {
      const c = contextData
      return `
        CURRICULUM CONTEXT:
        Program Name    : ${c.programName}
        Degree Type     : ${c.degreeType}
        Department      : ${c.department}
        Specialization  : ${c.specialization}
        Duration        : ${c.durationYears} years /
                          ${c.durationSemesters} semesters
        Total Credits   : ${c.totalCredits}

        SEMESTER WISE COURSES:
        ${c.generatedCurriculum.semesters.map(sem => `
          Semester ${sem.semesterNumber} (${sem.totalCredits} credits):
          ${sem.courses.map(course =>
            `  - ${course.courseCode}: ${course.courseName}
               (${course.credits} cr, ${course.type},
               Lab: ${course.hasLab ? "Yes" : "No"},
               Difficulty: ${course.difficultyLevel},
               Prerequisite: ${course.prerequisite || "None"})`
          ).join("\n")}
        `).join("\n")}

        PROGRAM OUTCOMES:
        ${c.generatedCurriculum.programOutcomes.map(po =>
          `PO${po.poNumber}: ${po.statement}`
        ).join("\n")}

        PROGRAM SUMMARY:
        Core Credits        : ${c.generatedCurriculum.programSummary.totalCoreCredits}
        Elective Credits    : ${c.generatedCurriculum.programSummary.totalElectiveCredits}
        Open Elective Credits: ${c.generatedCurriculum.programSummary.totalOpenElectiveCredits}
      `
    }

    if (contextType === "course") {
      const c = contextData
      return `
        COURSE CONTEXT:
        Course Name     : ${c.courseName}
        Course Code     : ${c.courseCode}
        Credits         : ${c.credits}
        Difficulty      : ${c.difficultyLevel}
        Course Type     : ${c.courseType}
        Includes Lab    : ${c.includesLab ? "Yes" : "No"}
        Number of Units : ${c.numberOfUnits}

        COURSE DESCRIPTION:
        ${c.generatedSyllabus.courseDescription}

        PREREQUISITES:
        ${c.generatedSyllabus.prerequisites.join(", ") || "None"}

        COURSE OBJECTIVES:
        ${c.generatedSyllabus.courseObjectives.map((obj, i) => `${i + 1}. ${obj}`).join("\n")}

        UNIT WISE SYLLABUS:
        ${c.generatedSyllabus.units.map(unit => `
          Unit ${unit.unitNumber}: ${unit.unitTitle}
          Topics: ${unit.topics.join(", ")}
          Estimated Hours: ${unit.estimatedHours}
        `).join("\n")}

        ${c.includesLab && c.generatedSyllabus.labSyllabus?.length ? `LAB SYLLABUS:
             ${c.generatedSyllabus.labSyllabus.map(exp => `
               Experiment ${exp.experimentNumber}: ${exp.title}
               Aim: ${exp.aim}
               Hours: ${exp.estimatedHours}
             `).join("\n")}` : ""}
      `
    }

    if (contextType === "program") {
      const c = contextData
      return `
        PROGRAM CONTEXT:
        Program Name    : ${c.programName}
        Difficulty Level: ${c.difficultyLevel}
        Number of Weeks : ${c.numberOfWeeks}
        Includes Capstone: ${c.includesCapstone ? "Yes" : "No"}

        PROGRAM OVERVIEW:
        ${c.generatedSchedule.programOverview}

        TARGET AUDIENCE:
        ${c.generatedSchedule.targetAudience}

        PREREQUISITES:
        ${c.generatedSchedule.prerequisites.join(", ")}

        LEARNING OUTCOMES:
        ${c.generatedSchedule.learningOutcomes.map((o, i) => `${i + 1}. ${o}`).join("\n")}

        WEEK WISE SCHEDULE:
        ${c.generatedSchedule.weeklySchedule.map(week => `
          Week ${week.weekNumber}: ${week.weekTitle}
          Theme: ${week.theme}
          Topics: ${week.topics.join(", ")}
          Activities: ${week.activities.join(", ")}
          Deliverables: ${week.deliverables.join(", ")}
          Hours: ${week.estimatedHours}
        `).join("\n")}

        ${c.includesCapstone && c.generatedSchedule.capstoneProject ? `CAPSTONE PROJECT:
             Title: ${c.generatedSchedule.capstoneProject.title}
             Description: ${c.generatedSchedule.capstoneProject.description}
             Objectives: ${c.generatedSchedule.capstoneProject.objectives.join(", ")}
             Deliverables: ${c.generatedSchedule.capstoneProject.deliverables.join(", ")}` : ""}

        PROGRAM SUMMARY:
        Total Hours       : ${c.generatedSchedule.programSummary.totalHours}
        Total Topics      : ${c.generatedSchedule.programSummary.totalTopics}
        Total Deliverables: ${c.generatedSchedule.programSummary.totalDeliverables}
        Recommended Tools : ${c.generatedSchedule.programSummary.recommendedTools.join(", ")}
      `
    }

    return "No context available."
  }

  const contextSummary = buildContextSummary(chatData.contextType, chatData.contextData)

  const response = await callWithRetry(() =>
    groq.chat.completions.create({
      model       : "llama-3.3-70b-versatile",
      temperature : 0.5,
      max_tokens  : 1024,
      messages: [
        {
          role: "system",
          content: `
        You are an expert, highly articulate educational tutor for CourseCraft AI. 
        You have access to a specific academic dataset (a curriculum, course syllabus, or program schedule).
        Your job is to teach and answer questions about the topics found within this dataset.

        YOUR KNOWLEDGE BASE (CONTEXT DATA):
        ${contextSummary}

        STRICT RESPONSE AND FILTERING RULES:
        1. CONTEXT LOCK: Review the CONTEXT DATA. You can ONLY answer if the user's question directly relates to concepts, tools, technologies, factual details, or topics present inside this dataset. If the question is completely unrelated to the subject matter of the dataset, reply with EXACTLY this word and nothing else:
           OUT_OF_CONTEXT

        2. ABSOLUTELY FORBIDDEN PHRASES (NO METADATA REFERENCES): 
           - Do NOT explicitly reference the structure or coordinates of the document. 
           - NEVER use phrases like: "In Week 2...", "Refer to Unit 4...", "Module 1 covers...", "According to the schedule...", "As seen in this course...", "Based on the provided context...".
           - Speak directly as an independent expert who simply knows the material.

        3. DYNAMIC & ADAPTIVE FORMATTING:
           Do NOT use a single fixed format for every answer. You must adapt your response structure organically to match the user's specific intent:
           - For "What is..." or conceptual questions: Provide a clear, direct explanation, followed by a brief example if applicable.
           - For "List..." or enumeration questions (e.g., prerequisites, topics, outcomes): Use clean, scannable bullet points.
           - For specific factual questions (e.g., "How many credits?", "Is there a lab?"): Answer directly and concisely in 1 or 2 sentences.
           - For "How-to" or process questions: Use clear numbered steps or logical paragraphs.
           
        4. TONE & STYLE: Keep your language highly readable. Use bold text to highlight key terms. Do not add conversational fluff at the beginning or end of your response. Answer the prompt directly.
        ${chatData.customInstructions ? "\\nCUSTOM INSTRUCTIONS:\\n" + chatData.customInstructions : ""}
      `
        },
        ...chatData.conversationHistory.slice(-10).map(msg => ({
          role    : msg.role,
          content : msg.content
        })),
        {
          role    : "user",
          content : chatData.userMessage
        }
      ]
    })
  );

  const raw = response.choices[0].message.content.trim()

  const isOutOfContext = raw === "OUT_OF_CONTEXT" || raw.startsWith("OUT_OF_CONTEXT")

  return {
    message      : isOutOfContext
                   ? "I can only answer questions related to the " +
                     "selected " + chatData.contextType + ". " +
                     "Please ask something about it."
                   : raw,
    isOutOfContext: isOutOfContext
  }
}
