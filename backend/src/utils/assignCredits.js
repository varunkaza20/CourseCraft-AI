export function assignCreditsToSlots(numSlots, totalCredits) {
  if (numSlots <= 0) return [];

  // Start every slot at 3 credits
  const credits = Array(numSlots).fill(3);
  let current   = credits.reduce((a, b) => a + b, 0);
  let diff      = totalCredits - current;

  // Adjust slots one by one to absorb the difference
  let i = 0;
  while (diff !== 0 && i < numSlots * 10) {
    const slotIdx = i % numSlots;
    if (diff > 0 && credits[slotIdx] < 4) {
      credits[slotIdx] += 1;
      diff -= 1;
    } else if (diff < 0 && credits[slotIdx] > 1) {
      credits[slotIdx] -= 1;
      diff += 1;
    }
    i++;
  }

  // If still not matching (edge case: too many slots for credits)
  // force-set last slot to absorb remainder
  const actualSum = credits.reduce((a, b) => a + b, 0);
  if (actualSum !== totalCredits) {
    credits[numSlots - 1] += (totalCredits - actualSum);
  }

  return credits;
}
