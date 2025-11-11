/**
 * Client-side API helper functions
 */

/**
 * Fetch all request logs for the current user
 */
export async function getMyRequestLogs() {
  const res = await fetch("/api/requests/my-logs");
  if (!res.ok) {
    throw new Error("Failed to fetch request logs");
  }
  return res.json();
}
