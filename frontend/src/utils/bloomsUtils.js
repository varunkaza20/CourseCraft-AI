const BLOOMS_LABEL_MAP = {
  "remember"   : "Remember",
  "understand" : "Understand",
  "apply"      : "Apply",
  "analyze"    : "Analyze",
  "analyse"    : "Analyze",
  "evaluate"   : "Evaluate",
  "create"     : "Create",

  // "ing" forms Groq sometimes returns — map to correct form
  "remembering"   : "Remember",
  "understanding" : "Understand",
  "applying"      : "Apply",
  "analyzing"     : "Analyze",
  "analysing"     : "Analyze",
  "evaluating"    : "Evaluate",
  "creating"      : "Create",

  // past tense variants just in case
  "remembered"   : "Remember",
  "understood"   : "Understand",
  "applied"      : "Apply",
  "analyzed"     : "Analyze",
  "evaluated"    : "Evaluate",
  "created"      : "Create"
}

export function normalizeBloomsLabel(raw) {
  if (!raw || typeof raw !== "string") return "Unknown"
  const key = raw.trim().toLowerCase()
  return BLOOMS_LABEL_MAP[key] || raw.trim()
}

export const BLOOMS_COLORS = {
  "Remember"   : {
    bg     : "#DBEAFE",
    text   : "#1D4ED8",
    border : "#BFDBFE"
  },
  "Understand" : {
    bg     : "#DCFCE7",
    text   : "#166534",
    border : "#BBF7D0"
  },
  "Apply"      : {
    bg     : "#EEEDFE",
    text   : "#534AB7",
    border : "#C4B5FD"
  },
  "Analyze"    : {
    bg     : "#FEF3C7",
    text   : "#92400E",
    border : "#FDE68A"
  },
  "Evaluate"   : {
    bg     : "#FFEDD5",
    text   : "#9A3412",
    border : "#FED7AA"
  },
  "Create"     : {
    bg     : "#FCE7F3",
    text   : "#9D174D",
    border : "#FBCFE8"
  }
}

export function getBloomsColor(raw) {
  const label = normalizeBloomsLabel(raw)
  return BLOOMS_COLORS[label] || {
    bg     : "#F3F4F6",
    text   : "#374151",
    border : "#E5E7EB"
  }
}

export const BLOOMS_ORDER = [
  "Remember",
  "Understand",
  "Apply",
  "Analyze",
  "Evaluate",
  "Create"
]
