import { assignCreditsToSlots } from "./assignCredits.js";

export function buildSemesterPlan(programData) {
  const { totalCredits, durationSemesters, electivePreference } = programData;

  const electiveCredits     = Math.round(totalCredits * electivePreference / 100);
  const openElectiveCredits = Math.round(totalCredits * 0.10);
  const coreCredits         = totalCredits - electiveCredits - openElectiveCredits;

  // Distribute totalCredits evenly across semesters
  const basePerSem  = Math.floor(totalCredits / durationSemesters);
  let remainder     = totalCredits - basePerSem * durationSemesters;
  const semCredits  = Array.from({ length: durationSemesters }, (_, i) => {
    let c = basePerSem;
    // Spread remainder into middle semesters
    if (remainder > 0 && i > 0 && i < durationSemesters - 1) {
      c += 1;
      remainder -= 1;
    }
    return c;
  });
  // If remainder still left, add to last semester
  if (remainder > 0) semCredits[durationSemesters - 1] += remainder;

  // Sanity check — must never fail
  const planSum = semCredits.reduce((a, b) => a + b, 0);
  if (planSum !== totalCredits) {
    throw new Error(`buildSemesterPlan bug: ${planSum} !== ${totalCredits}`);
  }

  // For each semester, decide how many courses and what types
  // then assign exact credit values per course in JS
  const semesterPlans = semCredits.map((targetCredits, idx) => {
    const semNum   = idx + 1;
    const isEarly  = semNum <= 2;
    const isFinal  = semNum === durationSemesters;
    const isMiddle = !isEarly && !isFinal;

    // Decide elective slot counts
    const electiveSlots     = isEarly ? 0 : isFinal ? 2 : 1;
    const openElectiveSlots = isEarly ? 0 : isFinal ? 1
                            : semNum >= Math.ceil(durationSemesters * 0.6) ? 1 : 0;
    const coreSlots         = Math.max(
                                2,
                                Math.round(targetCredits / 4)
                                - electiveSlots
                                - openElectiveSlots
                              );
    const totalSlots        = coreSlots + electiveSlots + openElectiveSlots;

    // Assign exact credits per slot using JS arithmetic only
    // Fill slots with 3s and 4s until we hit targetCredits exactly
    const slotCredits = assignCreditsToSlots(totalSlots, targetCredits);

    // Build slot descriptors for Groq (type + credits — credits already fixed)
    const slots = [];
    let slotIdx = 0;

    for (let i = 0; i < coreSlots; i++) {
      slots.push({ type: "core", credits: slotCredits[slotIdx++] });
    }
    for (let i = 0; i < electiveSlots; i++) {
      slots.push({ type: "elective", credits: slotCredits[slotIdx++] });
    }
    for (let i = 0; i < openElectiveSlots; i++) {
      slots.push({ type: "open_elective", credits: slotCredits[slotIdx++] });
    }

    return {
      semesterNumber : semNum,
      targetCredits,
      slots,
      progressionStage : isEarly  ? "foundational"
                       : isMiddle ? "intermediate-to-advanced"
                       : "capstone"
    };
  });

  return { electiveCredits, openElectiveCredits, coreCredits, semesterPlans };
}
