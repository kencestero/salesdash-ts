import crypto from "crypto";

export function todayCode() {
  // America/New_York midnight-based code
  const now = new Date();
  const ny = new Intl.DateTimeFormat("en-US", { 
    timeZone: "America/New_York",
    year: "numeric", 
    month: "2-digit", 
    day: "2-digit"
  }).formatToParts(now)
    .reduce((a, p) => { 
      if (p.type !== "literal") (a as any)[p.type] = p.value; 
      return a; 
    }, {} as any);
  
  const stamp = `${ny.year}-${ny.month}-${ny.day}`; // e.g. 2025-09-26
  const h = crypto.createHmac("sha256", process.env.AUTH_SECRET || "dev").update(stamp).digest("hex");
  return h.slice(0, 6).toUpperCase(); // 6-char daily code
}