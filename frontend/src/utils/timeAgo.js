/**
 * Returns a human-friendly "time ago" string from a date string.
 * @param {string|Date} dateString
 * @returns {string}
 */
export function timeAgo(dateString) {
  const now = new Date();
  const then = new Date(dateString);
  const diffSeconds = Math.floor((now - then) / 1000);

  if (diffSeconds < 60)    return "just now";
  if (diffSeconds < 3600)  return `${Math.floor(diffSeconds / 60)} minutes ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
  return `${Math.floor(diffSeconds / 86400)} days ago`;
}
