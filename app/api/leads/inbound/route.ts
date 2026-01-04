/**
 * Alias for /api/leads/prequalification
 * Both endpoints use the same handler - DO NOT duplicate logic
 *
 * This allows Remotive to use either:
 * - POST /api/leads/prequalification (primary)
 * - POST /api/leads/inbound (alias)
 */
export { GET, POST } from "../prequalification/route";
